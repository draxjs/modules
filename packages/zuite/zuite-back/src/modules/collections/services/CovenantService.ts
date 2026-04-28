
import type {ICovenantRepository} from "../interfaces/ICovenantRepository";
import type {ICovenantBase, ICovenant} from "../interfaces/ICovenant";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";
import ExcelJS from "exceljs";
import GroupZoneServiceFactory from "../factory/services/GroupZoneServiceFactory.js";

interface ICovenantExcelExportResult {
    buffer: Buffer
    fileName: string
}

class CovenantService extends AbstractService<ICovenant, ICovenantBase, ICovenantBase> {


    constructor(CovenantRepository: ICovenantRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(CovenantRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

    async exportExcel(date: string, groupId: string, createdBy?: string): Promise<ICovenantExcelExportResult> {
        const rows = await this.find({
            limit: 100000,
            orderBy: 'locality',
            order: 'asc',
            filters: [
                {field: 'date', operator: 'eq', value: date},
                {field: 'group', operator: 'eq', value: groupId},
                ...(createdBy ? [{field: 'createdBy', operator: 'eq', value: createdBy}] : []),
            ]
        })

        const group = await GroupZoneServiceFactory.instance.findById(groupId)
        const groupName = group?.name ?? 'convenios'
        const fileName = `${this.sanitizeFileName(groupName)}_${this.formatDateForFileName(date)}.xlsx`
        const workbook = new ExcelJS.Workbook()
        const worksheetName = fileName.replace(/\.xlsx$/i, '').slice(0, 31) || 'convenios'
        const worksheet = workbook.addWorksheet(worksheetName)

        const colors = ['FFECB3', 'CFD8DC', 'E1BEE7', 'BBDEFB', 'C5CAE9', 'B2DFDB', 'C8E6C9', 'F0F4C3', 'FFF9C4', 'FFE0B2', 'FFCCBC', 'F8BBD0', 'D7CCC8', 'F5F5F5']
        let colorIndex = 0
        const linkColors = new Map<string, string>()

        const getLinkColor = (link: string) => {
            const existingColor = linkColors.get(link)
            if (existingColor) {
                return existingColor
            }

            const nextColor = colors[colorIndex % colors.length]
            linkColors.set(link, nextColor)
            colorIndex += 1
            return nextColor
        }

        worksheet.columns = [
            {header: 'Localidad', key: 'locality', width: 18},
            {header: 'Direccion', key: 'address', width: 24},
            {header: 'Apellido y Nombre', key: 'fullname', width: 28},
            {header: 'DNI', key: 'dni', width: 14},
            {header: 'Mes', key: 'month', width: 10},
            {header: 'Monto', key: 'amount', width: 14},
            {header: 'Desde', key: 'since', width: 10},
            {header: 'Hasta', key: 'until', width: 10},
            {header: 'Observaciones', key: 'comment', width: 30},
        ]

        for (const row of rows) {
            const excelRow = worksheet.addRow({
                locality: row.locality,
                address: row.address,
                fullname: row.fullname,
                dni: row.dni,
                month: row.month,
                amount: row.amount,
                since: row.since,
                until: row.until,
                comment: row.comment ?? '',
            })

            if (row.link) {
                const fillColor = getLinkColor(row.link)
                excelRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {argb: fillColor}
                    }
                })
            }

            if (row.status === 'rechazado') {
                excelRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: {argb: 'D84315'}
                    }
                })
            }
        }

        worksheet.getRow(1).font = {bold: true}
        worksheet.views = [{state: 'frozen', ySplit: 1}]

        return {
            buffer: Buffer.from(await workbook.xlsx.writeBuffer()),
            fileName
        }
    }

    private sanitizeFileName(value: string) {
        return value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_')
            .replace(/[^A-Za-z0-9_-]/g, '')
            .replace(/^_+|_+$/g, '') || 'convenios'
    }

    private formatDateForFileName(date: string) {
        return new Date(date).toISOString().slice(0, 10)
    }

}

export default CovenantService
export {CovenantService}
