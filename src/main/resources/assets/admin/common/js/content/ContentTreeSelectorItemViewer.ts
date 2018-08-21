module api.content {

    import ContentUnnamed = api.content.ContentUnnamed;
    import ContentTreeSelectorItem = api.content.resource.ContentTreeSelectorItem;
    import Attribute = api.app.Attribute;

    export class ContentTreeSelectorItemViewer
        extends api.ui.NamesAndIconViewer<ContentTreeSelectorItem> {

        constructor() {
            super('content-tree-selector-item-viewer');
        }

        resolveDisplayName(object: ContentTreeSelectorItem): string {
            let contentName = object.getName();
            let invalid = !object.isValid() || !object.getDisplayName() || contentName.isUnnamed();
            let pendingDelete = object.getContentState().isPendingDelete();
            this.toggleClass('invalid', invalid);
            this.toggleClass('pending-delete', pendingDelete);

            return object.getDisplayName();
        }

        resolveUnnamedDisplayName(object: ContentTreeSelectorItem): string {
            return object.getType() ? object.getType().getLocalName() : '';
        }

        resolveSubName(object: ContentTreeSelectorItem, relativePath: boolean = false): string {
            let contentName = object.getName();
            if (relativePath) {
                return !contentName.isUnnamed() ? object.getName().toString() : ContentUnnamed.prettifyUnnamed();
            } else {
                return !contentName.isUnnamed() ? object.getPath().toString() :
                       ContentPath.fromParent(object.getPath().getParentPath(), ContentUnnamed.prettifyUnnamed()).toString();
            }
        }

        resolveSubTitle(object: ContentTreeSelectorItem): string {
            return object.getPath().toString();
        }

        resolveIconUrl(object: ContentTreeSelectorItem): string {
            if (object) {
                return new api.content.util.ContentIconUrlResolver().setContent(object.getContent()).resolve();
            }
        }

        resolveMainNameData(object: ContentTreeSelectorItem): Attribute {
            const lang = object ? object.getLanguage() : null;
            const value = !lang ? '' : `(${lang})`;
            return {name: 'locale', value};
        }
    }
}
