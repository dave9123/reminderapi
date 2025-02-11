export default function pagination(page: string = "1", limit: string = "10", data: Array<any>) {
    const currentPage = page ? parseInt(page.toString()) : 1;
    const currentLimit = limit ? parseInt(limit.toString()) : 10;
    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = currentPage * currentLimit;
    const results = data.slice(startIndex, endIndex);
    return {
        results,
        currentPage,
        totalPages: Math.ceil(data.length / currentLimit),
        totalEntries: data.length,
        hasNextPage: endIndex < data.length,
    }
}