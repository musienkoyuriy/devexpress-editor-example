import { EventEmitter, inject, Injectable, NgZone } from '@angular/core';
// import { Clipboard } from '@angular/cdk/clipboard';
// import { MatDialog } from '@angular/material/dialog';
import { asyncScheduler, BehaviorSubject, Observable, ReplaySubject, take, filter } from 'rxjs';
// import { isEmpty, isNil } from 'lodash';
import {
    CommandId,
    ContextMenuCommandId,
    FileTabCommandId,
    FileTabItemId,
    HomeTabCommandId,
    HomeTabItemId,
    MailMergeTabCommandId,
    MailMergeTabItemId,
    Options,
    RibbonButtonItem,
    RibbonButtonItemOptions,
    RibbonSubMenuItem,
    RibbonTabType,
    RichEdit,
    SubDocument,
} from 'devexpress-richedit';
import { IntervalApi } from 'devexpress-richedit/lib/model-api/interval';
import { DocumentFormatApi } from 'devexpress-richedit/lib/model-api/formats/enum';
import { CharacterPropertiesApi } from 'devexpress-richedit/lib/model-api/character-properties';
import { ParagraphPropertiesApi } from 'devexpress-richedit/lib/model-api/paragraph';
import { ClientRichEdit } from 'devexpress-richedit/lib/client/client-rich-edit';
import { FieldApi } from 'devexpress-richedit/lib/model-api/field';
import { RibbonMenuItem } from 'devexpress-richedit/lib/client/public/ribbon/items/menu';
import { Chunk } from 'devexpress-richedit/lib/core/model/chunk';
// import { MediumDialogConfig } from 'src/shared/dialog.configs';
// import { CompareService } from './compare.service';
// import { CommentService } from './comment.service';
// import { RICH_EDITOR_OPTIONS } from '../providers';
// import { TransformMergeFiels } from '../helpers/transform-merge-fields.helper';
// import { CUSTOM_CONTEXT_MENU_ITEMS, ICustomCommand, IMergeField, EMergeFieldState, TEXT_HIGHLIGHT_WARN_COLOR, BG_HIGHLIGHT_WARN_COLOR, MERGE_FIELD_KEY_REGEXP, TEXT_HIGHLIGHT_INITIAL_COLOR, TEXT_INITIAL_COLOR } from '../entities';
// import { AgreementCommentDto, AgreementTemplateCommentDto } from '../../../../../shared/service-proxies/service-proxies';
// import { NotificationDialogComponent } from '../../components/popUps/notification-dialog/notification-dialog.component';
// import { IMergeFieldItem } from '../components/insert-merge-field-popup/insert-merge-field-popup.component';

export type IMergeField = { [key: string]: string };

@Injectable()
export class EditorCoreService {
    /**
     * Allows additional functionality.
     * currently it's true only when we are in the agreements.
     */
    private _extendedMode = false;

    /**
     * Indicates if the editor data initialized.
     */
    private _initialised = false;

    /**
     * Rich editor by default marks the document as modified
     * when we set the document content, merge fields, comments, etc.
     * This flag allows us to skip this behavior.
     */
    private _skipTrackChanges = false;

    afterViewInit$ = new ReplaySubject();
    hasUnsavedChanges$ = new BehaviorSubject(false);

    // $mergeFieldState = signal<EMergeFieldState>(EMergeFieldState.Code);

    editor!: RichEdit;
    editorNative!: ClientRichEdit;
    mergeFields: IMergeField = {};

    onCompareTemplate$ = new EventEmitter<void>();
    onCompareVersion$ = new EventEmitter<void>();
    onSelectMergeField$ = new EventEmitter<void>();

    private documentLoaded$ = new ReplaySubject(1);

    // private readonly _options: Options = inject(RICH_EDITOR_OPTIONS);
    // private readonly _zone = inject(NgZone);
    // private readonly _compareService = inject(CompareService);
    // private readonly _commentService = inject(CommentService);
    // private readonly _clipboard = inject(Clipboard);
    // private readonly _dialog = inject(MatDialog);



    registerRichEditor(editor: RichEdit): void {
        this.editor = editor;
        this.editorNative = editor['_native'];
    }

    initialize(readonly = false, exportWithMergedData = false): void {
        this._extendedMode = !exportWithMergedData;
        this.editor.readOnly = readonly;

        if (!this._initialised) {
            // this._registerCustomEvents();
            // this._registerCustomContextMenuItems();
            // this._registerCopyMergeFieldCommand();
        }

        if (!readonly) {
            this._runTaskAsyncAndSkipTrackChanges(() => {
                if (this._initialised) return;
                // this._customizeRibbonPanel();
                // this._registerDocumentEvents(!exportWithMergedData);
                // this._initCompareTab();
                // this._initComments();
                this._initialised = true;
            });
        } else {
            this.editor.updateRibbon((ribbon) => {
                ribbon.activeTabIndex = 0;
            });
        }
    }

    loadDocument(template: File | Blob | ArrayBuffer | string, doc_name?: string): void {
        if (!this.editor) throw ReferenceError('Editor not initialized yet!, please call initialize().');
        this.editor.openDocument(template, doc_name ?? 'emagine_doc', DocumentFormatApi.OpenXml, () =>
            this.documentLoaded$.next(true)
        );
    }

    newDocument(): void {
        if (!this.editor) throw ReferenceError('Editor not initialized yet!, please call initialize().');
        this.editor.newDocument();
    }

    setMergeFields(mergeFields: IMergeField): void {
        this.mergeFields = mergeFields;
    }

    // applyMergeFields(fields: IMergeField, isCurrent: boolean): void {
    //     this.documentLoaded$
    //         .pipe(
    //             filter(() => !!Object.keys(fields).length),
    //             take(1)
    //         )
    //         .subscribe(() => {
    //             if (isCurrent) {
    //                 this.showMessageIfMergeFieldsOutDated(fields);
    //             }

    //             this._skipTrackChanges = true;

    //             this.editor.mailMergeOptions.setDataSource([fields], () => {
    //                 this._skipTrackChanges = false;
    //             });
    //         });
    // }

    destroy() {
        this.editor = null as any;
    }

    // private _triggerCustomCommand(command: ICustomCommand, parameter?: any) {
    //     this.editor.events.customCommandExecuted._fireEvent(this.editor, { commandName: command, parameter });
    // }

    private _downloadWithMergedData(command: CommandId) {
        this.editor.executeCommand(MailMergeTabCommandId.ToggleViewMergedData);
        this.editor.executeCommand(command);
        this.editor.executeCommand(MailMergeTabCommandId.ToggleViewMergedData);
    }

    private _runTaskAsyncAndSkipTrackChanges(task: () => void): void {
        this._skipTrackChanges = true;
        task();
        this._skipTrackChanges = false;
        this.hasUnsavedChanges$.next(false);
    }

    static mergeFieldValueIsEmpty(value: string): boolean {
        const pattern = /^<<.*>>$/;
        return value ? pattern.test(value) : true;
    }

    static cleanupMergeFieldValue(value: string): string | number | null {
        return EditorCoreService.mergeFieldValueIsEmpty(value) ? null : value;
    }

    static cleanupMergeFieldCode(code: string) {
        const regex = new RegExp(/\}.*?\>/g);
        return code.replace(regex, '}').replace(/{MERGEFIELD /g, '{');
    }
}
