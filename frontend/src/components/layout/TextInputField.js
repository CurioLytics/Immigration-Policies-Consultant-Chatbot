import React, { useState, useRef, useEffect } from 'react';
import './TextInputField.css';
import SendPlusIcon from '../../assets/icons/send_plus.svg'; // Icon cho nút 'add file'
import SendArrowUpIcon from '../../assets/icons/send_arrow_up.svg'; // Icon cho nút gửi khi có text
import AddDocumentShapeIcon from '../../assets/icons/add_document_shape.svg'; // Icon cho menu
import AddDocumentVectorIcon from '../../assets/icons/add_document_vector.svg'; // Icon cho menu
import AddDocumentBlankIcon from '../../assets/icons/empty_document.svg'; // Icon cho menu

const TextInputField = ({ value, onChange, placeholder, onSend, variant, disabled }) => {
  const hasValue = value && value.trim() !== '';
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null); // Ref cho input file ẩn
  const [isFileOptionsOpen, setIsFileOptionsOpen] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; // Reset height to correctly measure scrollHeight
      const currentScrollHeight = textarea.scrollHeight;

      const computedStyle = window.getComputedStyle(textarea);
      let textLineHeight = parseFloat(computedStyle.lineHeight);
      if (isNaN(textLineHeight) || textLineHeight <= 0) {
        const fontSize = parseFloat(computedStyle.fontSize) || 16;
        textLineHeight = fontSize * 1.4; // Approximate line height based on font size
      }
      
      const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
      const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
      
      const contentHeightWithoutPadding = currentScrollHeight - paddingTop - paddingBottom;
      const isEffectivelyOneLineOrLess = contentHeightWithoutPadding < (textLineHeight * 1.5);

      const maxLines = 7;
      const maxContentHeight = (textLineHeight * maxLines);
      const cappedHeightStyle = maxContentHeight + paddingTop + paddingBottom;

      if (isEffectivelyOneLineOrLess) {
        textarea.style.height = `${currentScrollHeight}px`;
        textarea.style.overflowY = 'hidden'; // Hide scrollbar
      } else {
        // For more than one line, set overflowY to 'scroll' to always show the scrollbar track.
        textarea.style.overflowY = 'scroll';

        if (currentScrollHeight <= cappedHeightStyle) {
          textarea.style.height = `${currentScrollHeight}px`;
        } else {
          textarea.style.height = `${cappedHeightStyle}px`;
        }
      }
    }
  }, [value]); // Rerun when value changes

  const handleKeyDown = (event) => {
    if (disabled) return;
    
    if (event.key === 'Enter') {
      if (event.ctrlKey || event.shiftKey) {
        // Allow newline
      } else {
        event.preventDefault();
        if (hasValue) {
          onSend();
        }
      }
    }
  };

  const toggleFileOptions = () => {
    if (disabled) return;
    setIsFileOptionsOpen(!isFileOptionsOpen);
  };

  const handleFileUploadClick = () => {
    if (disabled) return;
    fileInputRef.current.click(); // Kích hoạt input file
  };

  const handleFileSelected = (event) => {
    if (disabled) return;
    
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log("Selected files:", files);
      // TODO: Xử lý các tệp đã chọn (ví dụ: tải lên, hiển thị tên, v.v.)
    }
    setIsFileOptionsOpen(false); // Đóng menu sau khi chọn
    event.target.value = null; // Reset input file để có thể chọn lại cùng tệp
  };

  return (
    <div className={`text-input-field-container-figma ${variant === 'home' ? 'home-variant-input-container' : ''} ${disabled ? 'disabled' : ''}`}>
      <textarea
        ref={textareaRef}
        className="text-input-field-figma"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        rows="1"
        disabled={disabled}
      />
      {/* Input file ẩn */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileSelected}
        multiple // Cho phép chọn nhiều tệp, có thể bỏ nếu chỉ muốn một tệp
        disabled={disabled}
      />
      <div className="actions-row">
        <button
          onClick={toggleFileOptions}
          className="add-file-button-style"
          disabled={disabled}
        >
          <img src={SendPlusIcon} alt="Add file" className="add-file-icon-svg" />
        </button>
        {hasValue && (
          <button
            onClick={onSend}
            className="send-message-button"
            disabled={disabled}
          >
            <img src={SendArrowUpIcon} alt="Send" className="send-icon-svg" />
          </button>
        )}
      </div>

      {isFileOptionsOpen && !disabled && (
        <div className={`file-upload-options ${variant === 'chatbot' ? 'chatbot' : ''}`}>
          <div className="file-upload-option-item" onClick={handleFileUploadClick}>
            <span className="upload-option-icon-container">
              <img src={AddDocumentBlankIcon} alt="" className="upload-option-icon blank" />
            </span>
            <span>Chọn từ file đã tải</span>
          </div>
          <div className="file-upload-option-item" onClick={handleFileUploadClick}>
            <span className="upload-option-icon-container">
              <img src={AddDocumentShapeIcon} alt="" className="upload-option-icon shape" />
              <img src={AddDocumentVectorIcon} alt="" className="upload-option-icon vector" />
            </span>
            <span>Tải lên từ máy</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextInputField; 