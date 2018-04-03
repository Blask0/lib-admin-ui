module api.util.htmlarea.editor {

    import CreateHtmlAreaDialogEvent = api.util.htmlarea.dialog.CreateHtmlAreaDialogEvent;
    import HTMLAreaEditor = CKEDITOR.editor;

    export class HTMLAreaBuilderCKE {

        private content: api.content.ContentSummary; // used for image dialog
        // private contentPath: api.content.ContentPath; // used for macro dialog
        // private applicationKeys: ApplicationKey[]; // used for macro dialog

        private assetsUri: string;
        private editorContainerId: string;
        private focusHandler: (e: FocusEvent) => void;
        private blurHandler: (e: FocusEvent) => void;
        // private keydownHandler: (e: KeyboardEvent) => void;
        // private keyupHandler: (e: KeyboardEvent) => void;
        private nodeChangeHandler: (e: any) => void;
        private createDialogListeners: { (event: CreateHtmlAreaDialogEvent): void }[] = [];
        private inline: boolean = false;
        private fixedToolbarContainer: string;
        // private convertUrls: boolean = false;
        private hasActiveDialog: boolean = false;
        private customToolConfig: any;
        private editableSourceCode: boolean;
        // private forcedRootBlock: string;
        private toolsToExlcude: string = '';
        private toolsToInclude: string[] = [];

        private tools: any[] = [
            {name: 'gr1', items: ['Format', 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', 'Blockquote']},
            {name: 'gr2', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']},
            {name: 'gr3', items: ['BulletedList', 'NumberedList', 'Outdent', 'Indent']},
            {name: 'gr4', items: ['SpecialCharXP', 'Anchor', 'Image', 'Link', 'Unlink']},
            {name: 'gr5', items: ['Table', '-', 'PasteText', '-', 'Maximize']}
        ];

        private plugins: string = 'autogrow,codeTag,code,specialcharXP';

        setEditableSourceCode(value: boolean): HTMLAreaBuilderCKE {
            this.editableSourceCode = value;
            return this;
        }

        setAssetsUri(assetsUri: string): HTMLAreaBuilderCKE {
            this.assetsUri = assetsUri;
            return this;
        }

        setEditorContainerId(id: string): HTMLAreaBuilderCKE {
            this.editorContainerId = id;
            return this;
        }

        onCreateDialog(listener: (event: CreateHtmlAreaDialogEvent) => void) {
            this.createDialogListeners.push(listener);
            return this;
        }

        unCreateDialog(listener: (event: CreateHtmlAreaDialogEvent) => void) {
            this.createDialogListeners = this.createDialogListeners.filter((curr) => {
                return curr !== listener;
            });
            return this;
        }

        private notifyCreateDialog(event: CreateHtmlAreaDialogEvent) {
            this.createDialogListeners.forEach((listener) => {
                listener(event);
            });
        }

        setFocusHandler(focusHandler: (e: FocusEvent) => void): HTMLAreaBuilderCKE {
            this.focusHandler = focusHandler;
            return this;
        }

        setBlurHandler(blurHandler: (e: FocusEvent) => void): HTMLAreaBuilderCKE {
            this.blurHandler = blurHandler;
            return this;
        }

        // setKeydownHandler(keydownHandler: (e: KeyboardEvent) => void): HTMLAreaBuilderCKE {
        //     this.keydownHandler = keydownHandler;
        //     return this;
        // }

        // setKeyupHandler(keyupHandler: (e: KeyboardEvent) => void): HTMLAreaBuilderCKE {
        //     this.keyupHandler = keyupHandler;
        //     return this;
        // }

        setNodeChangeHandler(nodeChangeHandler: (e: any) => void): HTMLAreaBuilderCKE {
            this.nodeChangeHandler = api.util.AppHelper.debounce((e) => {
                nodeChangeHandler(e);
            }, 200);

            return this;
        }

        setInline(inline: boolean): HTMLAreaBuilderCKE {
            this.inline = inline;
            return this;
        }

        setFixedToolbarContainer(fixedToolbarContainer: string): HTMLAreaBuilderCKE {
            this.fixedToolbarContainer = fixedToolbarContainer;
            return this;
        }

        setContent(content: api.content.ContentSummary): HTMLAreaBuilderCKE {
            this.content = content;
            return this;
        }

        // setContentPath(contentPath: api.content.ContentPath): HTMLAreaBuilderCKE {
        //     this.contentPath = contentPath;
        //     return this;
        // }

        // setConvertUrls(convertUrls: boolean): HTMLAreaBuilderCKE {
        //     this.convertUrls = convertUrls;
        //     return this;
        // }

        // setApplicationKeys(applicationKeys: ApplicationKey[]): HTMLAreaBuilderCKE {
        //     this.applicationKeys = applicationKeys;
        //     return this;
        // }

        private includeTools(tools: any[]) {
            tools.forEach((tool: any) => {
                this.includeTool(tool);
            });
        }

        private includeTool(tool: string) {
            this.toolsToInclude.push(tool);
        }

        setTools(tools: any): HTMLAreaBuilderCKE {
            this.customToolConfig = tools;

            if (tools['exclude'] && tools['exclude'] instanceof Array) {
                this.toolsToExlcude = tools['exclude'].join();
            }
            if (tools['include'] && tools['include'] instanceof Array) {
                this.includeTools(tools['include']);
            }

            return this;
        }

        // setForcedRootBlock(el: string): HTMLAreaBuilderCKE {
        //     this.forcedRootBlock = el;
        //
        //     return this;
        // }

        private checkRequiredFieldsAreSet() {
            if (!this.assetsUri || !this.editorContainerId || !this.content) {
                throw new Error('some required fields are missing for tinymce editor');
            }
        }

        public createEditor(): HTMLAreaEditor {
            this.checkRequiredFieldsAreSet();

            if (this.editableSourceCode && !this.isToolExcluded('Code')) {
                this.includeTool('Code');
            }

            this.tools.push({name: 'custom', items: this.toolsToInclude});

            const config: CKEDITOR.config = {
                toolbar: this.tools,
                removePlugins: 'resize',
                removeButtons: this.toolsToExlcude,
                extraPlugins: this.plugins + (this.inline ? ',sharedspace' : ''),
                autoGrow_onStartup: true,
                contentsCss: this.assetsUri + '/admin/common/styles/api/util/htmlarea/html-editor.css', // for classic mode only
                sharedSpaces: this.inline ? {top: this.fixedToolbarContainer} : null
            };

            const ckeditor: HTMLAreaEditor = this.inline ? CKEDITOR.inline(this.editorContainerId, config) : CKEDITOR.replace(
                this.editorContainerId, config);

            ckeditor.on('change', () => {
                if (this.nodeChangeHandler) {
                    this.nodeChangeHandler(null);
                }
            });

            ckeditor.on('focus', (e) => {
                if (this.focusHandler) {
                    this.focusHandler(<any>e);
                }
            });

            ckeditor.on('maximize', (e) => {
                if (e.data === 2) { // fullscreen off
                    api.ui.responsive.ResponsiveManager.fireResizeEvent();
                }
            });

            ckeditor.on('blur', (e) => {
                if (this.hasActiveDialog) {
                    //e.stopImmediatePropagation();
                    this.hasActiveDialog = false;
                }
                if (this.blurHandler) {
                    this.blurHandler(<any>e);
                }
            });

            ckeditor.addCommand('openCodeDialog', {
                exec: (editor) => {
                    this.notifyCodeDialog(editor);
                    return true;
                }
            });

            ckeditor.addCommand('openSpecialCharDialog', {
                exec: (editor) => {
                    this.notifySpecialCharDialog(editor);
                    return true;
                }
            });

            CKEDITOR.plugins.addExternal('code', this.assetsUri + '/admin/common/js/util/htmlarea/plugins/', 'codeCKE.js');
            CKEDITOR.plugins.addExternal('specialcharXP', this.assetsUri + '/admin/common/js/util/htmlarea/plugins/', 'specialcharCKE.js');

            return ckeditor;
        }

        // private notifyLinkDialog(config: any) {
        //     let event = CreateHtmlAreaDialogEvent.create().setConfig(config).setType(
        //         api.util.htmlarea.dialog.HtmlAreaDialogType.LINK).setContent(this.content).build();
        //     this.publishCreateDialogEvent(event);
        // }
        //
        // private notifyImageDialog(config: any) {
        //     let event = CreateHtmlAreaDialogEvent.create().setConfig(config).setType(
        //         api.util.htmlarea.dialog.HtmlAreaDialogType.IMAGE).setContent(this.content).build();
        //     this.publishCreateDialogEvent(event);
        // }
        //
        // private notifyAnchorDialog(config: any) {
        //     let event = CreateHtmlAreaDialogEvent.create().setConfig(config).setType(
        //         api.util.htmlarea.dialog.HtmlAreaDialogType.ANCHOR).build();
        //     this.publishCreateDialogEvent(event);
        // }
        //
        // private notifyMacroDialog(config: any) {
        //     let event = CreateHtmlAreaDialogEvent.create().setConfig(config).setType(
        //         api.util.htmlarea.dialog.HtmlAreaDialogType.MACRO).setContentPath(this.contentPath).setApplicationKeys(
        //         this.applicationKeys).setType(api.util.htmlarea.dialog.HtmlAreaDialogType.MACRO).setContent(
        //         this.content).setApplicationKeys(this.applicationKeys).build();
        //     this.publishCreateDialogEvent(event);
        // }
        //
        // private notifySearchReplaceDialog(config: any) {
        //     let event = CreateHtmlAreaDialogEvent.create().setConfig(config).setType(
        //         api.util.htmlarea.dialog.HtmlAreaDialogType.SEARCHREPLACE).build();
        //     this.publishCreateDialogEvent(event);
        // }

        private notifyCodeDialog(editor: HTMLAreaEditor) {
            let event = CreateHtmlAreaDialogEvent.create().setConfig(editor).setType(
                api.util.htmlarea.dialog.HtmlAreaDialogType.CODE_CKE).build();
            this.publishCreateDialogEvent(event);
        }

        private notifySpecialCharDialog(editor: HTMLAreaEditor) {
            let event = CreateHtmlAreaDialogEvent.create().setConfig(editor).setType(
                api.util.htmlarea.dialog.HtmlAreaDialogType.SPECIALCHAR_CKE).build();
            this.publishCreateDialogEvent(event);
        }

        private publishCreateDialogEvent(event: CreateHtmlAreaDialogEvent) {
            this.hasActiveDialog = true;
            this.notifyCreateDialog(event);
            event.fire();
        }

        private isToolExcluded(tool: string): boolean {
            if (!this.customToolConfig || !this.customToolConfig['exclude']) {
                return false;
            }
            return this.customToolConfig['exclude'].indexOf(tool) > -1;
        }
    }
}
