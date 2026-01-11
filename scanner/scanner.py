# ================================================================
# FIXED & IMPROVED DOCUMENT SCANNER (2026 – FINAL VERSION)
# ================================================================

import cv2
import numpy as np
from typing import Dict


class DocumentScanner:

    def __init__(self):
        self.debug = False

    # ================================================================
    # MAIN ENTRY FUNCTION
    # ================================================================
    def scan_document(self, input_path: str, output_path: str,
                      enhance_mode: str = 'adaptive', width: int = 900) -> Dict:

        image = cv2.imread(input_path)

        if image is None:
            return {"success": False, "message": "Image cannot be read."}

        original_size = (image.shape[1], image.shape[0])

        # ------------------------------------------------------------
        # STEP 1: PREPROCESS
        # ------------------------------------------------------------
        resized, ratio = self._resize(image, width)
        mask = self._white_mask(resized)
        edged = self._edge_detection(mask)

        # ------------------------------------------------------------
        # STEP 2: FIND DOCUMENT CONTOUR
        # ------------------------------------------------------------
        contour = self._find_document_contour(edged)

        # Fallback 1: If no contour found, return full image crop
        if contour is None:
            h, w = edged.shape
            contour = np.array([
                [0, 0],
                [w, 0],
                [w, h],
                [0, h]
            ], dtype=np.float32)

        contour = contour.reshape(4, 2)
        contour = contour * ratio

        # ------------------------------------------------------------
        # STEP 3: WARP PERSPECTIVE
        # ------------------------------------------------------------
        ordered = self._order_points(contour)
        warped = self._four_point_transform(image, ordered)

        # ------------------------------------------------------------
        # STEP 4: ENHANCE OUTPUT
        # ------------------------------------------------------------
        enhanced = self._enhance(warped, enhance_mode)
        cv2.imwrite(output_path, enhanced)

        return {
            "success": True,
            "message": "Document scanned successfully!",
            "original_size": original_size,
            "output_size": (enhanced.shape[1], enhanced.shape[0])
        }

    # ================================================================
    # RESIZE FUNCTION
    # ================================================================
    def _resize(self, image, width=900):
        ratio = image.shape[1] / float(width)
        new_height = int(image.shape[0] / ratio)
        resized = cv2.resize(image, (width, new_height))
        return resized, ratio

    # ================================================================
    # WHITE MASKING (KEY FIX)
    # ================================================================
    # def _white_mask(self, image):
    #     hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    #     lower = np.array([0, 0, 120])       # detect off-white
    #     upper = np.array([180, 80, 255])    # allow brighter and yellowish tones
    #     mask = cv2.inRange(hsv, lower, upper)

    #     # Remove noise
    #     kernel = np.ones((5, 5), np.uint8)
    #     mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
    #     return mask
    def _white_mask(self, image):
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        L, A, B = cv2.split(lab)

    # Increase contrast on L channel
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        L_enhanced = clahe.apply(L)

        # Threshold on enhanced L channel only
        _, mask = cv2.threshold(L_enhanced, 180, 255, cv2.THRESH_BINARY)
    # Clean mask
        kernel = np.ones((7, 7), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)

        return mask

    # ================================================================
    # EDGE DETECTION PIPELINE
    # ================================================================
    # def _edge_detection(self, mask):
    #     blurred = cv2.GaussianBlur(mask, (5, 5), 0)

    #     # Improve contrast for weak paper edges
    #     enhanced = cv2.equalizeHist(blurred)

    #     # Low thresholds for faint edges
    #     edged = cv2.Canny(enhanced, 30, 120)

    #     edged = cv2.dilate(edged, None, iterations=2)
    #     edged = cv2.morphologyEx(edged, cv2.MORPH_CLOSE,
    #                              np.ones((5, 5), np.uint8), iterations=2)

    #     return edged
    def _edge_detection(self, mask):
    # blur to smooth noise
        blurred = cv2.GaussianBlur(mask, (7, 7), 0)

    # strong Sobel edge extraction
        sobelx = cv2.Sobel(blurred, cv2.CV_64F, 1, 0, ksize=5)
        sobely = cv2.Sobel(blurred, cv2.CV_64F, 0, 1, ksize=5)
        sobel = cv2.magnitude(sobelx, sobely)
        sobel = np.uint8(np.clip(sobel, 0, 255))

    # Canny on sobel
        edged = cv2.Canny(sobel, 50, 150)

    # thicken edges
        kernel = np.ones((5, 5), np.uint8)
        edged = cv2.dilate(edged, kernel, iterations=2)
        edged = cv2.morphologyEx(edged, cv2.MORPH_CLOSE, kernel, iterations=2)

        return edged

    # ================================================================
    # CONTOUR DETECTION
    # ================================================================
    # def _find_document_contour(self, edged):

    #     contours, _ = cv2.findContours(
    #         edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    #     )

    #     if not contours:
    #         return None

    #     contours = sorted(contours, key=cv2.contourArea, reverse=True)
    #     # remove tiny dust-like contours
    #     contours = [c for c in contours if cv2.contourArea(c) > 2000]


    #     h, w = edged.shape
    #     min_area = (w * h) * 0.05
    #     max_area = (w * h) * 0.95

    #     for cnt in contours[:10]:
    #         area = cv2.contourArea(cnt)

    #         if not (min_area < area < max_area):
    #             continue

    #         peri = cv2.arcLength(cnt, True)
    #         approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

    #         # Must have exactly 4 corners and be convex
    #         if len(approx) == 4 and cv2.isContourConvex(approx):
    #             return approx

    #     return None
         # ================================================================
    # CONTOUR DETECTION
    # ================================================================
    def _find_document_contour(self, edged):

        contours, _ = cv2.findContours(
            edged, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )

        if not contours:
            # No contours → return full image fallback
            h, w = edged.shape
            return np.array([
                [[0, 0]],
                [[w, 0]],
                [[w, h]],
                [[0, h]]
            ], dtype=np.int32)

        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        contours = [c for c in contours if cv2.contourArea(c) > 2000]

        h, w = edged.shape
        min_area = (w * h) * 0.05
        max_area = (w * h) * 0.95

        for cnt in contours[:10]:
            area = cv2.contourArea(cnt)

            if not (min_area < area < max_area):
                continue

            peri = cv2.arcLength(cnt, True)
            approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

            if len(approx) == 4 and cv2.isContourConvex(approx):
                return approx

        # FINAL FAILSAFE
        return np.array([
            [[0, 0]],
            [[w, 0]],
            [[w, h]],
            [[0, h]]
        ], dtype=np.int32)


    # ================================================================
    # ORDER POINTS CLOCKWISE
    # ================================================================
    def _order_points(self, pts):
        rect = np.zeros((4, 2), dtype=np.float32)
        s = pts.sum(axis=1)

        rect[0] = pts[np.argmin(s)]      # top-left
        rect[2] = pts[np.argmax(s)]      # bottom-right

        diff = np.diff(pts, axis=1)
        rect[1] = pts[np.argmin(diff)]   # top-right
        rect[3] = pts[np.argmax(diff)]   # bottom-left

        return rect

    # ================================================================
    # PERSPECTIVE TRANSFORM
    # ================================================================
    def _four_point_transform(self, image, pts):

        (tl, tr, br, bl) = pts

        widthA = np.linalg.norm(br - bl)
        widthB = np.linalg.norm(tr - tl)
        maxWidth = int(max(widthA, widthB))

        heightA = np.linalg.norm(tr - br)
        heightB = np.linalg.norm(tl - bl)
        maxHeight = int(max(heightA, heightB))

        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]
        ], dtype="float32")

        M = cv2.getPerspectiveTransform(pts, dst)
        warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))

        return warped

    # ================================================================
    # ENHANCEMENT
    # ================================================================
    def _enhance(self, image, mode):

        if mode == "adaptive":
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            enhanced = cv2.adaptiveThreshold(
                gray, 255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                11, 2
            )
            return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

        elif mode == "clahe":
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(gray)
            return cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)

        elif mode == "sharpen":
            kernel = np.array([
                [-1, -1, -1],
                [-1, 9, -1],
                [-1, -1, -1]
            ])
            return cv2.filter2D(image, -1, kernel)

        return image