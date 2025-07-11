import { defineStore } from "pinia";
import en from "../utils/i18n/en";
import vn from "../utils/i18n/vn";
import jp from "../utils/i18n/jp";
import fr from "../utils/i18n/fr";
import rs from "../utils/i18n/rs";
import ch from "../utils/i18n/ch";
import kr from "../utils/i18n/kr";

export const useLanguageStore = defineStore('language', {
    state: () => ({
        currentLanguage: localStorage.getItem('lang') || 'vn',
        translations: {
            en: en,
            vn: vn,
            jp: jp,
            fr: fr,
            rs: rs,
            ch: ch,
            kr: kr,
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