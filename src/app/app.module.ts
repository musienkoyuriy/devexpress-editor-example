import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RichEditorDirective } from './rich-editor.directive';
import { RichEditorOptionsProvider } from './rich-editor-options.provider';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RichEditorDirective
  ],
  providers: [RichEditorOptionsProvider],
  bootstrap: [AppComponent]
})
export class AppModule { }
