class BaseService {
    constructor() {
        if (this.constructor.instance) {
            return this.constructor.instance;
        }
        this.constructor.instance = this;
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new this();
        }
        return this.instance;
    }
}

module.exports = BaseService; 