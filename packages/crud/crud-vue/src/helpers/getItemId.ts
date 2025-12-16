const getItemId = (item: any) => {
    if(item && item._id) {
        return item._id
    }else if(item && item.id) {
        return item.id
    }else if(item && item.uuid) {
        return item.uuid
    }

    return null
}

export default getItemId
export {getItemId}
