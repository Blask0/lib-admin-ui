import {ManagedActionState} from './ManagedActionState';
import {ManagedActionExecutor} from './ManagedActionExecutor';

export type StateChangedListener = (state: ManagedActionState, executor: ManagedActionExecutor) => void;

export class ManagedActionManager {

    private static INSTANCE: ManagedActionManager = null;

    private executors: ManagedActionExecutor[] = [];

    private managedActionStateChangedListeners: StateChangedListener[] = [];

    constructor() {
        ManagedActionManager.INSTANCE = this;
    }

    static instance(): ManagedActionManager {
        if (ManagedActionManager.INSTANCE) {
            return ManagedActionManager.INSTANCE;
        } else if (window !== window.parent) {
            // look for instance in parent frame
            let apiAppModule = (<any> window.parent).api.managedaction;
            if (apiAppModule && apiAppModule.ManagedActionManager) {
                let parentManagedActionManager = <ManagedActionManager> apiAppModule.ManagedActionManager.INSTANCE;
                if (parentManagedActionManager) {
                    ManagedActionManager.INSTANCE = parentManagedActionManager;
                }
            }
        }
        return new ManagedActionManager();
    }

    addPerformer(executor: ManagedActionExecutor) {
        this.executors.push(executor);
    }

    removePerformer(executor: ManagedActionExecutor) {
        this.executors = this.executors.filter(p => p !== executor);
    }

    isExecuting(): boolean {
        return this.executors.some(p => p.isExecuting());
    }

    onManagedActionStateChanged(listener: StateChangedListener) {
        const alreadyHasListener = this.managedActionStateChangedListeners.some(l => l === listener);
        if (!alreadyHasListener) {
            this.managedActionStateChangedListeners.push(listener);
        }
    }

    unManagedActionStateChanged(listener: StateChangedListener) {
        this.managedActionStateChangedListeners = this.managedActionStateChangedListeners.filter(l => l !== listener);
    }

    notifyManagedActionStateChanged(state: ManagedActionState, executor: ManagedActionExecutor) {
        this.managedActionStateChangedListeners.forEach(handler => handler(state, executor));
    }
}
