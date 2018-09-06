module api.ui.text {

    import CompositeFormInputEl = api.dom.CompositeFormInputEl;
    import Button = api.ui.button.Button;
    import H2El = api.dom.H2El;

    export class InPlaceTextInput
        extends CompositeFormInputEl {

        private input: TextInput;
        private h2: H2El;
        private toggleButton: Button;
        private persistedValue: string;

        private modeListeners: { (editMode: boolean, newValue: string, oldValue: string) }[] = [];
        private outsideClickListener: (event: MouseEvent) => void;

        constructor(originalValue?: string, size?: string) {
            super();
            this.addClass('inplace-text-input');

            this.initElements(originalValue, size);
            this.addElements();
        }

        private initElements(originalValue: string, size: string) {
            this.createHeader(originalValue);
            this.createInput(originalValue, size);
            this.createToggleButton();
        }

        private createHeader(originalValue: string) {
            this.h2 = new H2El('inplace-text');
            this.h2.setHtml(this.formatTextToDisplay(originalValue), false);
            this.h2.onDblClicked(() => this.setEditMode(true));
        }

        private createInput(originalValue: string, size: string) {
            this.input = new TextInput('inplace-input', size, originalValue);

            this.input.onValueChanged(() => {
                const isValid = this.isInputValid();
                this.input.toggleClass('invalid', !isValid);
                this.toggleClass('invalid', !isValid);
            });

            this.input.onKeyDown((event: KeyboardEvent) => {
                event.stopImmediatePropagation();
                switch (event.keyCode) {
                case 27:
                    this.setEditMode(false, true);
                    break;
                case 13:
                    if (this.isInputValid()) {
                        this.setEditMode(false);
                    }
                    break;
                }
            });
        }

        private createToggleButton() {
            this.toggleButton = new Button();
            this.toggleButton.onClicked(() => {
                if (this.isInputValid()) {
                    this.setEditMode(!this.isEditMode());
                }
            });
            this.toggleButton.setClass('inplace-toggle');
        }

        private addElements() {
            this.setWrappedInput(this.input);
            this.addAdditionalElement(this.h2);
            this.addAdditionalElement(this.toggleButton);
        }

        private isInputValid(): boolean {
            return !api.util.StringHelper.isBlank(this.input.getValue());
        }

        public setEditMode(flag: boolean, cancel?: boolean) {
            if (cancel) {
                this.input.setValue(this.persistedValue, true);
                this.input.removeClass('invalid');
                this.removeClass('invalid');
            }
            this.toggleClass('edit-mode', flag);
            const newValue = this.input.getValue().trim();
            if (flag) {
                this.persistedValue = newValue;
            } else {
                this.h2.setHtml(this.formatTextToDisplay(newValue), false);
            }
            this.bindOutsideClickListener(flag);
            this.notifyEditModeChanged(flag, newValue, this.persistedValue);
        }

        private bindOutsideClickListener(flag: boolean) {
            const body = api.dom.Body.get();
            if (!this.outsideClickListener) {
                this.outsideClickListener = (event: MouseEvent) => {
                    if (this.isEditMode() && !this.getEl().contains(<HTMLElement>event.target)) {
                        this.setEditMode(false, true);
                    }
                };
            }
            if (flag) {
                body.onClicked(this.outsideClickListener);
            } else {
                body.unClicked(this.outsideClickListener);
            }
        }

        setValue(value: string, silent?: boolean, userInput?: boolean): InPlaceTextInput {
            super.setValue(value, silent, userInput);
            this.h2.setHtml(this.formatTextToDisplay(value), false);
            return this;
        }

        public formatTextToDisplay(inputValue: string): string {
            return inputValue;
        }

        public isEditMode(): boolean {
            return this.hasClass('edit-mode');
        }

        public onEditModeChanged(listener: (editMode: boolean, newValue: string, oldValue: string) => void) {
            this.modeListeners.push(listener);
        }

        public unEditModeChanged(listener: (editMode: boolean, newValue: string, oldValue: string) => void) {
            this.modeListeners = this.modeListeners.filter(curr => curr !== listener);
        }

        private notifyEditModeChanged(editMode: boolean, newValue: string, oldValue: string) {
            this.modeListeners.forEach(listener => {
                listener(editMode, newValue, oldValue);
            });
        }
    }
}
