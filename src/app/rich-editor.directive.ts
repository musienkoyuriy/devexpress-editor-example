import {
	AfterViewInit,
	Directive,
	ElementRef,
	EventEmitter,
	OnDestroy,
	Output,
	inject,
} from '@angular/core';
import { create, Options, RichEdit } from 'devexpress-richedit';
import { RICH_EDITOR_OPTIONS } from './rich-editor-options.provider';

@Directive({
	standalone: true,
	selector: '[richEditor]',
	host: { '[class.readonly]': 'readonly' }
})
export class RichEditorDirective implements AfterViewInit, OnDestroy {
	editor: RichEdit | null = null;

	@Output() saved = new EventEmitter<void>();
	@Output() documentReady = new EventEmitter<void>();

	private readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
	private readonly editorOptions: Options = inject(RICH_EDITOR_OPTIONS, { skipSelf: true });

	ngAfterViewInit(): void {
		this.editor = create(this._elementRef.nativeElement, this.editorOptions);

		const position = this.editor.selection.active;
		const activeSubDocument = this.editor.selection.activeSubDocument;

		const field = activeSubDocument.fields.createMergeField(position, 'MF value');

		const text = activeSubDocument.getText(field.codeInterval);

		const replaced = text.replace(/["]+/g, '');

		activeSubDocument.deleteText(field.codeInterval);
		activeSubDocument.insertText(field.codeInterval.start, replaced);
	}

	ngOnDestroy(): void {
		if (this.editor) {
			this.editor.dispose();
			this.editor = null;
		}
	}
}
