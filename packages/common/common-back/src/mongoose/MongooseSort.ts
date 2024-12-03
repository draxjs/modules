
type SortResult = { [key: string]: 1 | -1 } | null;

class MongooseSort{

    static applySort(orderBy: string, order: 'asc' | 'desc'| boolean):SortResult {
        if(orderBy){
            return { [orderBy]: (order === 'desc' || order === true)? -1 : 1}
        }else{
            return null
        }
    }

}

export default MongooseSort;
export {MongooseSort}
