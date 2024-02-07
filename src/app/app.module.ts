import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RichEditorDirective } from './rich-editor.directive';
import { RichEditorOptionsProvider } from './rich-editor-options.provider';
import { EditorCoreService } from './editor-core.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RichEditorDirective
  ],
  providers: [RichEditorOptionsProvider, EditorCoreService],
  bootstrap: [AppComponent]
})
export class AppModule { }
