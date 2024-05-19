import { ICorrespondant as Correspondant } from '../types/ICorrespondant'

export interface IDBCrud {

    index(): any,
    findByCorrNo(corr_no: String): any,
    getBetween(offset: number, limit: number): any,
    addNewCorrespondant(new_corr_obj: Correspondant): Promise<Boolean>,
    deleteCorrespondant(corr_no: String): Promise<Boolean>,
    deleteMany(corrs_to_delete: []): Promise<Boolean>,
    untrash(corrs_to_untrash: []): Promise<Boolean>,
    getTrashed(): any,
    deleteAllCorrespondants(): Promise<Boolean>,
    updateCorrespondant(corr_no: String, corr_updates: Object): Promise<Boolean>,
    filterCorrespondents(query: String): any,
    starCorrespondent(corr_no: String, update: Boolean): Promise<Boolean>,
    filterStarred(): any
}