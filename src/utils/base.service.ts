export abstract class BaseService {
    private static instance: BaseService;

    protected constructor() {
        if ((this.constructor as typeof BaseService).instance) {
            return (this.constructor as typeof BaseService).instance;
        }
        (this.constructor as typeof BaseService).instance = this;
    }

    public static getInstance<T extends BaseService>(): T {
        if (!this.instance) {
            this.instance = new (this as any)();
        }
        return this.instance as T;
    }
} 