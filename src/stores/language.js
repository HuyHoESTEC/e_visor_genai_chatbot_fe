import { defineStore } from "pinia";
import en from "../utils/i18n/en";
import vn from "../utils/i18n/vn";
import jp from "../utils/i18n/jp";

export const useLanguageStore = defineStore('language', {
    state: () => ({
        currentLanguage: localStorage.getItem('lang') || 'vn',
        translations: {
            en: en,
            vn: vn,
            jp: jp,
        },
    }),
    getters: {
        t: (state) => (key) => {
            return state.translations[state.currentLanguage][key] || key;
        },
        getLanguage: (state) => state.currentLanguage,
    },
    actions: {
        /**
         * @param {string} langCode
         */
        setLanguage(langCode) {
            if (this.translations[langCode]) {
                this.currentLanguage = langCode;
                localStorage.setItem('lang', langCode);
                console.log(`Ngôn ngữ đã được chuyển sang: ${langCode}`);
            } else {
                console.warn(`Ngôn ngữ "${langCode}" không được hỗ trợ.`);
            }
        }
    }
});