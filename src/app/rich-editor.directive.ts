import {
	AfterViewInit,
	Directive,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	Output,
	inject,
} from '@angular/core';

import { create, Options, RichEdit } from 'devexpress-richedit';
// import { RICH_EDITOR_OPTIONS } from '../providers';
import { fromEvent, Subscription, ReplaySubject } from 'rxjs';

import { EditorCoreService, IMergeField } from './editor-core.service';
import { RICH_EDITOR_OPTIONS } from './rich-editor-options.provider';

@Directive({
	standalone: true,
	selector: '[richEditor]',
	host: { '[class.readonly]': 'readonly' }
})
export class RichEditorDirective implements AfterViewInit, OnDestroy {
	private _rulerInitialPosition = 0;
	private _initialized = new ReplaySubject(1);
	private _commentModeEnabled = false;
	private _subscriptions: Subscription[] = [];
	editor: RichEdit | null = null;

	@Input() readonly = false;
	@Input() isCurrent = false;
	@Input() exportWithMergedData = false;

	@Input() set template(template: File | Blob | ArrayBuffer | string | null) {
		// this._registerTemplateChanges(template);
	}

	@Input() set mergeFields(fields: IMergeField) {
		this._registerMergeFields(fields, this.isCurrent);
	}

	@Output() saved = new EventEmitter<void>();
	@Output() documentReady = new EventEmitter<void>();

	private readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
	private readonly editorOptions: Options = inject(RICH_EDITOR_OPTIONS, { skipSelf: true });
	private readonly editorService = inject(EditorCoreService, { skipSelf: true });

	ngAfterViewInit(): void {
		this.editor = create(this._elementRef.nativeElement, this.editorOptions);
		this.editorService.registerRichEditor(this.editor);
	}

	private _registerMergeFields(fields: IMergeField, isCurrent: boolean) {
		// const subscription = this._initialized.subscribe(() => {
		// 	this.editorService.applyMergeFields(fields, isCurrent);
		// });
		// this._subscriptions.push(subscription);
	}

	ngOnDestroy(): void {
		if (this.editor) {
			this.editor.dispose();
			this.editor = null;
			this.editorService.destroy();
			this._subscriptions.forEach((sub) => sub.unsubscribe());
		}
	}
}
