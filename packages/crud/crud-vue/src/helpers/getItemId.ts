const getItemId = (item: any) => {
    if(item && item._id) {
        return item._id
    }else if(item && item.id) {
        return item.id
    }
    return null
}

export default getItemId
export {getItemId}
