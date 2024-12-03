class SqlSort {

    static applySort(orderBy: string, order: 'asc' | 'desc'| boolean):string {
        if(orderBy){
            return ' ORDER BY ' + orderBy + ( (order === 'desc' || order === true) ? ' DESC ' : '')
        }else{
            return ''
        }
    }

}

export default SqlSort;
export {SqlSort}
