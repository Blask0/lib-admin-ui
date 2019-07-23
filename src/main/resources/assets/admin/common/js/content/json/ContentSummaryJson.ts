module api.content.json {

    export interface ContentSummaryJson
        extends api.item.ItemJson {

        name: string;

        displayName: string;

        path: string;

        isRoot: boolean;

        hasChildren: boolean;

        type: string;

        iconUrl: string;

        thumbnail: api.thumb.ThumbnailJson;

        modifier: string;

        owner: string;

        inherited: boolean;

        isPage: boolean;

        isValid: boolean;

        requireValid: boolean;

        childOrder: ChildOrderJson;

        publish: ContentPublishTimeRangeJson;

        language: string;

        contentState: string;
    }
}
