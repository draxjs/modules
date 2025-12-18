export interface IMetric {
    title: string
    actionValue: string
    icon: string
    value: number
    percentage: number
    percentageBasis: 'previous_period' | 'total_actions'
    percentageColor: string
}

export interface IMetricBase {
    value: string
    basis: 'previous_period' | 'total_actions'
}