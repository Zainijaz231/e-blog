import { Editor } from '@tinymce/tinymce-react';
import { uploadImageToCloudinary, blobToFile } from '../utils/imageUpload';

const RichTextEditor = ({ value, onChange, placeholder = "Start writing..." }) => {
    const editorConfig = {
        height: 400,
        menubar: false,
        // Domain configuration for production
        referrer_policy: 'origin',
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'codesample', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
            'autosave', 'save', 'directionality', 'code', 'nonbreaking', 'pagebreak',
            'importcss', 'template', 'advtable', 'advcode', 'tableofcontents'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | ' +
            'bold italic underline strikethrough | forecolor backcolor | ' +
            'alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | blockquote hr pagebreak | ' +
            'table tabledelete | tableprops tablerowprops tablecellprops | ' +
            'tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
            'tableinsertcolbefore tableinsertcolafter tabledeletecol | ' +
            'link image media codesample | ' +
            'emoticons charmap | searchreplace | ' +
            'visualblocks code preview fullscreen help',
        content_style: `
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                font-size: 14px;
                line-height: 1.6;
                color: #374151;
                padding: 16px;
            }
            h1, h2, h3, h4, h5, h6 {
                color: #111827;
                margin-top: 1.5em;
                margin-bottom: 0.5em;
            }
            p {
                margin-bottom: 1em;
            }
            blockquote {
                border-left: 4px solid #e5e7eb;
                margin: 1.5em 0;
                padding-left: 1em;
                color: #6b7280;
                font-style: italic;
            }
            code {
                background-color: #f3f4f6;
                padding: 2px 4px;
                border-radius: 4px;
                font-family: 'Monaco', 'Consolas', monospace;
                font-size: 0.9em;
            }
            pre {
                background-color: #1f2937;
                color: #f9fafb;
                padding: 1em;
                border-radius: 8px;
                overflow-x: auto;
            }
            img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                margin: 1em 0;
            }
            table td, table th {
                border: 1px solid #e5e7eb;
                padding: 8px 12px;
                text-align: left;
            }
            table th {
                background-color: #f9fafb;
                font-weight: 600;
            }
            .simple-table {
                border: none;
            }
            .simple-table td, .simple-table th {
                border: none;
                border-bottom: 1px solid #e5e7eb;
            }
            .striped-table tr:nth-child(even) {
                background-color: #f9fafb;
            }
            .bordered-table {
                border: 2px solid #374151;
            }
            .bordered-table td, .bordered-table th {
                border: 1px solid #374151;
            }
            .header-cell {
                background-color: #dbeafe !important;
                font-weight: 600;
                color: #1e40af;
            }
            .highlight-cell {
                background-color: #fef3c7 !important;
                color: #92400e;
            }
            .header-row {
                background-color: #f3f4f6;
                font-weight: 600;
            }
            .odd-row {
                background-color: #f9fafb;
            }
            .even-row {
                background-color: #ffffff;
            }
        `,
        placeholder: placeholder,
        branding: false,
        resize: false,
        statusbar: true,
        elementpath: false,
        skin: 'oxide',
        content_css: 'default',
        block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre',
        fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
        font_family_formats: 'Inter=Inter, sans-serif; Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,palatino,serif; Helvetica=helvetica,arial,sans-serif; Times New Roman=times new roman,times,serif; Verdana=verdana,geneva,sans-serif',
        link_default_target: '_blank',
        link_assume_external_targets: true,
        image_advtab: true,
        image_caption: true,
        image_title: true,
        image_description: false,
        image_dimensions: true,
        image_class_list: [
            {title: 'None', value: ''},
            {title: 'Responsive', value: 'img-responsive'},
            {title: 'Rounded', value: 'img-rounded'},
            {title: 'Circle', value: 'img-circle'},
            {title: 'Thumbnail', value: 'img-thumbnail'}
        ],
        automatic_uploads: true,
        file_picker_types: 'image',
        images_upload_url: '/api/upload/image',
        images_upload_base_path: '',
        images_upload_credentials: true,
        images_reuse_filename: true,
        images_upload_handler: async (blobInfo, progress, failure) => {
            return new Promise(async (resolve, reject) => {
                try {
                    // Show progress
                    progress(0);
                    
                    // Convert blob to file
                    const file = blobToFile(blobInfo.blob(), blobInfo.filename() || 'image.png');
                    
                    // Show progress
                    progress(50);
                    
                    // Upload to Cloudinary via backend
                    const imageUrl = await uploadImageToCloudinary(file);
                    
                    // Complete progress
                    progress(100);
                    
                    // Return the Cloudinary URL
                    resolve(imageUrl);
                } catch (error) {
                    console.error('Image upload failed:', error);
                    reject('Image upload failed. Please try again.');
                }
            });
        },
        // Autosave configuration
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: 'tinymce-autosave-{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        // Enhanced media embed
        media_live_embeds: true,
        media_url_resolver: (data, resolve) => {
            if (data.url.indexOf('youtube.com') !== -1 || data.url.indexOf('youtu.be') !== -1) {
                const embedUrl = data.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
                resolve({
                    html: `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`
                });
            } else {
                resolve({html: ''});
            }
        },
        // Image and paste configurations
        paste_data_images: true,
        paste_as_text: false,
        paste_webkit_styles: 'none',
        paste_remove_styles_if_webkit: true,
        images_file_types: 'jpg,jpeg,png,gif,webp',
        file_picker_callback: (callback, value, meta) => {
            if (meta.filetype === 'image') {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                
                input.onchange = async function() {
                    const file = this.files[0];
                    if (file) {
                        try {
                            const imageUrl = await uploadImageToCloudinary(file);
                            callback(imageUrl, { 
                                alt: file.name,
                                title: file.name 
                            });
                        } catch (error) {
                            console.error('File picker upload failed:', error);
                            callback('', { alt: '' }); // Return empty on error
                        }
                    }
                };
                
                input.click();
            }
        },
        // Import from Word support
        paste_word_valid_elements: 'b,strong,i,em,h1,h2,h3,h4,h5,h6,p,ol,ul,li,a[href],span,color,font-size,font-color,font-family,mark,table,tr,td,th',
        paste_retain_style_properties: 'color font-size font-family',
        contextmenu: 'link image table',
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
        quickbars_insert_toolbar: 'quickimage quicktable',
        // Enhanced table features
        table_default_attributes: {
            border: '1'
        },
        table_default_styles: {
            'border-collapse': 'collapse',
            'width': '100%'
        },
        table_class_list: [
            {title: 'None', value: ''},
            {title: 'Simple Table', value: 'simple-table'},
            {title: 'Striped Table', value: 'striped-table'},
            {title: 'Bordered Table', value: 'bordered-table'}
        ],
        table_cell_class_list: [
            {title: 'None', value: ''},
            {title: 'Header Cell', value: 'header-cell'},
            {title: 'Highlight Cell', value: 'highlight-cell'}
        ],
        table_row_class_list: [
            {title: 'None', value: ''},
            {title: 'Header Row', value: 'header-row'},
            {title: 'Odd Row', value: 'odd-row'},
            {title: 'Even Row', value: 'even-row'}
        ],
        setup: (editor) => {
            editor.on('init', () => {
                const container = editor.getContainer();
                container.style.transition = 'border-color 0.2s, box-shadow 0.2s';
                container.style.borderRadius = '8px';
                container.style.border = '1px solid #d1d5db';
            });
            
            editor.on('focus', () => {
                const container = editor.getContainer();
                container.style.borderColor = '#3b82f6';
                container.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            });
            
            editor.on('blur', () => {
                const container = editor.getContainer();
                container.style.borderColor = '#d1d5db';
                container.style.boxShadow = 'none';
            });
        }
    };

    return (
        <div className="rich-text-editor">
            <Editor
                apiKey="1dpchi08n0gntv3alm6ur11uycbhb170ljsnoepqolss263z"
                value={value}
                onEditorChange={onChange}
                init={editorConfig}
            />
        </div>
    );
};

export default RichTextEditor;