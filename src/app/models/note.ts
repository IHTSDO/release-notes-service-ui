export class Note {
    title: string;
    parentId?: string;
    level?: string;

    constructor(title, parentId?, level?) {
        this.title = title;
        this.parentId = parentId;
        this.level = level;
    }
}
