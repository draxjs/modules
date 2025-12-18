
import {AbstractCrudRestProvider} from "@drax/crud-front";
import type {IAudit, IAuditBase, IMetricBase} from '@drax/audit-share'

class AuditProvider extends AbstractCrudRestProvider<IAudit, IAuditBase, IAuditBase> {

  static singleton: AuditProvider

  constructor() {
   super('/api/audits')
  }

  static get instance() {
    if(!AuditProvider.singleton){
      AuditProvider.singleton = new AuditProvider()
    }
    return AuditProvider.singleton
  }

  async getMetrics(payload: {metrics: IMetricBase[], period: string}): Promise<{
    metrics: {metric: string, basis: string, value: number, percentage: number}[], 
    total_actions: number
  }> {
    const periodDate: Date = this.getPeriodDate(payload.period);

    const resolve: {
      metrics: {metric: string, basis: string, value: number, percentage: number}[];
      total_actions: number;
    } = {metrics: [], total_actions: 0};

    const total_actions = await this.paginate({
      filters: [
        {field: 'createdAt', operator: 'gte', value: this.getPeriodDate(payload.period)}
      ]
    })

    const promises: Promise<{metric: string, basis: string, value: number, percentage: number}>[] = []

    for(const metric of payload.metrics) {
      promises.push(new Promise(async (resolve, reject) => {
        const filters = [
          { field: 'createdAt', operator: 'gte', value: periodDate }
        ]
  
        if(metric.value != 'total_actions') filters.push(
          { field: 'action', operator: 'eq', value: metric.value }
        )
  
        const total_actions_by_period = await this.paginate({
          filters: filters
        })
  
        if(metric.basis === 'previous_period') {
          
          const previousFilters = [
            { field: 'createdAt', operator: 'gte', value: this.getPeriodDate(payload.period, periodDate) },
            { field: 'createdAt', operator: 'lte', value: periodDate }
          ]
  
          if(metric.value != 'total_actions') previousFilters.push(
            { field: 'action', operator: 'eq', value: metric.value }
          )
  
          const previous_period_actions = await this.paginate({
            filters: previousFilters
          });
          
          resolve({
            metric: metric.value,
            basis: metric.basis,
            value: total_actions_by_period.total,
            percentage: previous_period_actions.total > 0 ? (total_actions_by_period.total - previous_period_actions.total) / previous_period_actions.total * 100 : total_actions_by_period.total
          });
        }else {
          resolve({
            metric: metric.value,
            basis: metric.basis,
            value: total_actions_by_period.total,
            percentage: total_actions > 0 ? (total_actions_by_period.total / total_actions) * 100 : 0
          });
        }
      }))

    }

    const results = await Promise.all(promises)
    
    resolve.metrics = results;
    return resolve
  }

  getPeriodDate(period: string, initial?: Date): Date {
    const now = initial || new Date();
    switch(period) {
      case '1h':
        now.setHours(now.getHours() - 1);
        break;
      case '24h':
        now.setHours(now.getHours() - 24);
        break;
      case '7d':
        now.setDate(now.getDate() - 7);
        break;
      case '30d':
        now.setDate(now.getDate() - 30);
        break;
      default:
        throw new Error('Invalid period');
    }
    return now;
  }

  async getStatistics(period: string): Promise<{activity: {user: string, actions: number}[], actionsPerEntity: {entity: string, actions: {name: string, value: number}[]}[], percentagePerAction: {action: string, percentage: number, color: string}[], actionsPerPeriod: number[]}> {
    const promises: Promise<any>[] = []
    
    // activity

    promises.push(new Promise(async (resolve, reject) => {
      try {
        const result = await this.groupBy({
          fields: ['user'],
          filters: [
            {field: 'createdAt', operator: 'gte', value: this.getPeriodDate(period)}
          ]
        })
        resolve(result.map(r => ({user: r.user.username, actions: r.count})).slice(0, 5).sort((a, b) => b.actions - a.actions))
      }catch(error) {
        console.error('[getStatistics - activity Error]: ', error)
        reject(error)
      }
    }))

    // actionsPerPeriod

    promises.push(new Promise(async (resolve, reject) => {
      try {

        const hours = [0, 4, 8, 12, 16, 20]

        const resultPromises = hours.map(h => new Promise(async (resolve, reject) => {
          try {
            const sinceDate = new Date()
            sinceDate.setHours(h - 4)
            const untilDate = new Date()
            untilDate.setHours(h)

            const result = await this.paginate({
              page: 1, limit: 1, filters: [
                {field: 'createdAt', operator: 'gt', value: sinceDate},
                {field: 'createdAt', operator: 'lte', value: untilDate}
              ]
            })

            resolve(result.total)
          } catch (error) {
            console.error('[getStatistics - sparkline Error]: ', error)
            reject(error)
          }
        }))

        const results = await Promise.all(resultPromises)

        resolve(results)
      }catch(error) {
        console.error('[getStatistics - actionsPerPeriod Error]: ', error)
        reject(error)
      }
    }))

    // percentagePerAction

    promises.push(new Promise(async (resolve, reject) => {
      try {
        const result = await this.groupBy({
          fields: ['action'],
          filters: [
            {field: 'createdAt', operator: 'gte', value: this.getPeriodDate(period)}
          ]
        })
        const total = result.reduce((acc, item) => acc + item.count, 0)

        resolve(result.map(r => ({action: r.action, percentage: r.count / total * 100})).sort((a, b) => b.percentage - a.percentage))
      } catch (error) {
        console.error('[getStatistics -  percentagePerAction]: ', error)
        reject(error)
      }
    }))

    // actionsPerEntity

    promises.push(new Promise(async (resolve, reject) => {
      try {
        const result = await this.groupBy({
          fields: ['entity', 'action'],
          filters: [
            {field: 'createdAt', operator: 'gte', value: this.getPeriodDate(period)}
          ]
        })
        
        let entities: {entity: string, actions: {name: string, value: number}[]}[] = []

        for(const item of result) {
          const { entity, action, count } = item;
          if(!entities.find(e => e.entity === entity)) entities.push({entity, actions: []})
          entities.find(e => e.entity === entity)?.actions.push({name: action, value: count})
        }
        resolve(entities)
      } catch (error) {
        console.error('[getStatistics - actionsPerEntity Error]: ', error)
        reject(error)
      }
    }))

    const [activity, actionsPerPeriod, percentagePerAction, actionsPerEntity] = await Promise.all(promises)
    return {activity, actionsPerPeriod, percentagePerAction, actionsPerEntity}
  }

}

export default AuditProvider

