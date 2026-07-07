import sys
import json
import cv2
import pytesseract
import re
import os

def process_image(image_path):
    if not os.path.exists(image_path):
        return {"status": "error", "message": f"Image not found: {image_path}"}

    try:
        # Load the image
        img = cv2.imread(image_path)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding to preprocess the image
        # Using Otsu's thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Perform OCR
        # Note: You may need to specify tesseract_cmd if it's not in PATH, e.g.,
        # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
        text = pytesseract.image_to_string(thresh)
        
        # Search for a Student ID or Roll Number using Regex
        # Adjust this regex based on actual ID card formats!
        # This currently looks for "ID:", "Roll No:", or "Enrollment No:" followed by alphanumeric characters
        id_pattern = r'(?:ID|Roll\s*No|Enrollment\s*No)[\s\.:-]*([A-Z0-9]+)'
        
        match = re.search(id_pattern, text, re.IGNORECASE)
        
        if match:
            student_id = match.group(1).strip()
            return {"status": "success", "studentId": student_id, "rawText": text}
        else:
            # Fallback: if we didn't find the exact label, try to find a standalone 
            # 6 to 12 character alphanumeric string that might be the ID.
            # (This is highly dependent on the card design)
            fallback_pattern = r'\b([A-Z]{2,3}\d{4,6})\b'
            fallback_match = re.search(fallback_pattern, text)
            if fallback_match:
                return {"status": "success", "studentId": fallback_match.group(1), "rawText": text}
            
            return {"status": "error", "message": "Could not identify a Student ID in the scanned text.", "rawText": text}

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No image path provided."}))
        sys.exit(1)
        
    image_path = sys.argv[1]
    result = process_image(image_path)
    
    # Print exactly one line of JSON to stdout
    print(json.dumps(result))
