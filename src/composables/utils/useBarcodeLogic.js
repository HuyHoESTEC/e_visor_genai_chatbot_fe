import JsBarcode from "jsbarcode";
import { computed, nextTick, ref, watch } from "vue";

/**
 * @param {Ref<Object | null>} selectedItem - Ref chứa item đang được xem chi tiết.
 * @param {Ref<Boolean>} isDetailVisible - Ref cho biết popup chi tiết có hiển thị không. 
 */
export function useBarcodeLogic(selectedItem, isDetailVisible) {
    const barcodeRef = ref(null);

    const generateBarcode = (partNo, seriNumber) => {
        if (partNo && seriNumber) {
            return `${partNo}+${seriNumber}`;
        }
        return 'N/A';
    };

    const generatedBarcode = computed(() => {
        if (selectedItem.value) {
            const partNoClean = selectedItem.value.part_no ? String(selectedItem.value.part_no).replace(/[^0-9A-Z]/g, '') : '';
            const seriNumberClean = selectedItem.value.seri_number ? String(selectedItem.value.seri_number).replace(/[^0-9A-Z]/g, '') : '';

            return generateBarcode(partNoClean, seriNumberClean);
        }
        return 'N/A';
    });

    const renderBarcode = (code) => {
        if (code && code !== 'N/A' && barcodeRef.value) {
            try {
                JsBarcode(barcodeRef.value, code, {
                    format: "CODE128",
                    displayValue: true,
                    width: 2,
                    height: 100,
                    margin: 10
                });
            } catch (e) {
                console.error("Lỗi khi render JsBarcode:", e);
            }
        }
    };

    const downloadBarcodeSvg = () => {
        if (!generatedBarcode.value || generatedBarcode.value === 'N/A') {
            console.warn("Không thể tải về. Barcode không hợp lệ hoặc chưa được render.");
            return;
        }

        const svgElement = barcodeRef.value;
        if (!svgElement) {
            console.error("Không tìm thấy phần tử SVG để tải về.");
            return;
        }

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const downloadLink = document.createElement('a');
        downloadLink.href = svgUrl;
        const fileName = `${generatedBarcode.value}.svg`;
        downloadLink.download = fileName;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(svgUrl);
    };

    watch([isDetailVisible, generatedBarcode], ([isDetail, barcodeValue]) => {
        if (isDetail && barcodeValue && barcodeValue !== 'N/A') {
            nextTick(() => {
                renderBarcode(barcodeValue);
            });
        }
    });

    return {
        barcodeRef,
        generatedBarcode,
        downloadBarcodeSvg,
    }
}