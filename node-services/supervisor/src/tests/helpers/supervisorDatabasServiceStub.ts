import SupervisorDatabaseService from '../../domain/server-side/supervisorDatabaseService';

export class SupervisorDatabaseServiceStub implements SupervisorDatabaseService {
    public async openConnection(): Promise<void> {}
    public async getSupervisedEntity(id: string): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public supervisedEntities: any[] = [];

    public async getSupervisedEntities(): Promise<any[]> {
        const supervised: any[] = [];
        this.supervisedEntities.forEach((entity) => supervised.push(entity));
        return supervised;
    }

    public async saveSupervisedEntity(supervisedEntity: any): Promise<void> {
        const index = this.supervisedEntities.findIndex((entity) => entity.entityId === supervisedEntity.entityId);
        if (index >= 0) {
            this.supervisedEntities.splice(index, 1);
        }
        this.supervisedEntities.push(supervisedEntity);
    }

    public async deleteSupervisedEntity(id: string): Promise<void> {
        const index = this.supervisedEntities.findIndex((entity) => entity.entityId === id);
        if (index >= 0) {
            this.supervisedEntities.splice(index, 1);
        }
    }
}
