/**
 * Système de composants boutons suivant les principes SOLID
 * 
 * S - Single Responsibility: Chaque classe a une responsabilité unique
 * O - Open/Closed: Extensible sans modification
 * L - Liskov Substitution: Les sous-types sont substituables
 * I - Interface Segregation: Interfaces spécifiques
 * D - Dependency Inversion: Dépend d'abstractions
 */

// Abstraction de base (Dependency Inversion Principle)
class IButtonRenderer {
    render(config) {
        throw new Error('render() doit être implémentée');
    }
}

// Implémentation concrète pour Alpine.js (Single Responsibility Principle)
class AlpineButtonRenderer extends IButtonRenderer {
    render(config) {
        const classes = this._buildClasses(config);
        const attributes = this._buildAttributes(config);
        const content = this._buildContent(config);
        
        return `<button ${attributes} class="${classes}">${content}</button>`;
    }
    
    _buildClasses(config) {
        const baseClasses = [
            'inline-flex', 'items-center', 'px-4', 'py-2', 
            'text-sm', 'font-medium', 'font-display', 'rounded-md',
            'transition-colors', 'duration-200', 'focus:outline-none',
            'focus:ring-2', 'focus:ring-offset-2'
        ];
        
        return [...baseClasses, ...config.styleClasses, ...(config.customClasses || [])].join(' ');
    }
    
    _buildAttributes(config) {
        const attrs = [];
        
        if (config.click) attrs.push(`@click="${config.click}"`);
        if (config.xShow) attrs.push(`x-show="${config.xShow}"`);
        if (config.disabled) attrs.push('disabled');
        if (config.type) attrs.push(`type="${config.type}"`);
        if (config.href) attrs.push(`onclick="window.location.href='${config.href}'"`);
        
        return attrs.join(' ');
    }
    
    _buildContent(config) {
        let content = '';
        
        if (config.icon) {
            content += `<svg class="${config.iconClasses || '-ml-1 mr-2 h-5 w-5'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${config.icon}
            </svg>`;
        }
        
        content += config.text || '';
        
        if (config.badge) {
            content += `<span class="${config.badgeClasses || 'ml-2 bg-gray-800 text-gray-300 py-0.5 px-2.5 rounded-full text-xs font-medium'}">${config.badge}</span>`;
        }
        
        return content;
    }
}

// Factory pour créer les styles (Open/Closed Principle)
class ButtonStyleFactory {
    static createPrimary() {
        return {
            styleClasses: [
                'text-white', 'bg-generique', 'hover:bg-generique/80',
                'focus:ring-generique', 'focus:ring-offset-gray-900',
                'disabled:bg-gray-600', 'disabled:text-gray-400', 
                'disabled:border-gray-600', 'disabled:cursor-not-allowed',
                'disabled:hover:bg-gray-600', 'disabled:hover:text-gray-400'
            ]
        };
    }
    
    static createSecondary() {
        return {
            styleClasses: [
                'text-gray-300', 'bg-gray-800', 'border', 'border-gray-600',
                'hover:bg-gray-700', 'hover:text-white',
                'focus:ring-generique', 'focus:ring-offset-black',
                'disabled:bg-gray-700', 'disabled:text-gray-500', 
                'disabled:border-gray-700', 'disabled:cursor-not-allowed',
                'disabled:hover:bg-gray-700', 'disabled:hover:text-gray-500'
            ]
        };
    }
    
    static createDanger() {
        return {
            styleClasses: [
                'text-red-400', 'bg-transparent',
                'hover:bg-red-900', 'hover:text-red-300',
                'focus:ring-red-500', 'focus:ring-offset-gray-900',
                'disabled:bg-gray-700', 'disabled:text-gray-500', 
                'disabled:cursor-not-allowed',
                'disabled:hover:bg-gray-700', 'disabled:hover:text-gray-500'
            ]
        };
    }
    
    static createSuccess() {
        return {
            styleClasses: [
                'text-green-400', 'bg-transparent',
                'hover:bg-green-900', 'hover:text-green-300',
                'focus:ring-green-500', 'focus:ring-offset-gray-900',
                'disabled:bg-gray-700', 'disabled:text-gray-500', 
                'disabled:cursor-not-allowed',
                'disabled:hover:bg-gray-700', 'disabled:hover:text-gray-500'
            ]
        };
    }
}

// Builders pour différents types de boutons (Interface Segregation Principle)
class CreateButtonBuilder {
    constructor(renderer) {
        this.renderer = renderer;
        this.config = ButtonStyleFactory.createPrimary();
    }
    
    withText(text) {
        this.config.text = text;
        return this;
    }
    
    withIcon(iconPath) {
        this.config.icon = iconPath;
        return this;
    }
    
    withClick(action) {
        this.config.click = action;
        return this;
    }
    
    withHref(url) {
        this.config.href = url;
        return this;
    }
    
    build() {
        return this.renderer.render(this.config);
    }
}

class ActionButtonBuilder {
    constructor(renderer) {
        this.renderer = renderer;
        this.config = ButtonStyleFactory.createSecondary();
    }
    
    withText(text) {
        this.config.text = text;
        return this;
    }
    
    withIcon(iconPath) {
        this.config.icon = iconPath;
        return this;
    }
    
    withClick(action) {
        this.config.click = action;
        return this;
    }
    
    withStyle(styleName) {
        switch (styleName) {
            case 'danger':
                this.config = { ...this.config, ...ButtonStyleFactory.createDanger() };
                break;
            case 'success':
                this.config = { ...this.config, ...ButtonStyleFactory.createSuccess() };
                break;
            case 'primary':
                this.config = { ...this.config, ...ButtonStyleFactory.createPrimary() };
                break;
        }
        return this;
    }
    
    build() {
        return this.renderer.render(this.config);
    }
}

// Service principal (Liskov Substitution Principle)
class ButtonService {
    constructor(renderer = new AlpineButtonRenderer()) {
        this.renderer = renderer;
    }
    
    createNewButton() {
        return new CreateButtonBuilder(this.renderer)
            .withText('Créer nouveau')
            .withIcon('<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>')
            .withClick('ouvert = !ouvert');
    }
    
    createActionButton() {
        return new ActionButtonBuilder(this.renderer);
    }
    
    // Méthodes utilitaires pour les icônes courantes
    static icons = {
        plus: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>',
        user: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
        document: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
        download: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
        trash: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>',
        edit: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>',
        copy: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>'
    };
}

// Utilisation globale
window.ButtonService = ButtonService;
window.buttonService = new ButtonService();