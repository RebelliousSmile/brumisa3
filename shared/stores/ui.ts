import { defineStore } from 'pinia'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  titre: string
  message?: string
  duree?: number
  actions?: Array<{
    label: string
    action: () => void
    primary?: boolean
  }>
}

interface Modal {
  id: string
  component: string
  props?: Record<string, any>
  persistent?: boolean
}

interface UiState {
  notifications: Notification[]
  modals: Modal[]
  sidebarOuverte: boolean
  themeMode: 'light' | 'dark' | 'auto'
  chargementGlobal: boolean
  messageChargement: string
}

export const useUiStore = defineStore('ui', {
  state: (): UiState => ({
    notifications: [],
    modals: [],
    sidebarOuverte: false,
    themeMode: 'auto',
    chargementGlobal: false,
    messageChargement: ''
  }),

  getters: {
    nombreNotifications: (state) => state.notifications.length,
    
    notificationsParType: (state) => (type: Notification['type']) =>
      state.notifications.filter(n => n.type === type),
      
    modalActive: (state) => state.modals.length > 0 ? state.modals[state.modals.length - 1] : null,
    
    nombreModals: (state) => state.modals.length
  },

  actions: {
    toggleSidebar() {
      this.sidebarOuverte = !this.sidebarOuverte
      this.sauvegarderPreferences()
    },

    setSidebarOuverte(ouverte: boolean) {
      this.sidebarOuverte = ouverte
      this.sauvegarderPreferences()
    },

    setThemeMode(mode: UiState['themeMode']) {
      this.themeMode = mode
      if (process.client) {
        this.sauvegarderPreferences()
        this.appliquerTheme()
      }
    },

    appliquerTheme() {
      if (process.client) {
        const html = document.documentElement
        
        if (this.themeMode === 'dark') {
          html.classList.add('dark')
        } else if (this.themeMode === 'light') {
          html.classList.remove('dark')
        } else {
          const prefereDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (prefereDark) {
            html.classList.add('dark')
          } else {
            html.classList.remove('dark')
          }
        }
      }
    },

    chargerPreferencesTheme() {
      if (process.client) {
        const themeMode = localStorage.getItem('theme-mode') as UiState['themeMode']
        const sidebarOuverte = localStorage.getItem('sidebar-ouverte')
        
        if (themeMode && ['light', 'dark', 'auto'].includes(themeMode)) {
          this.themeMode = themeMode
          this.appliquerTheme()
        }
        
        if (sidebarOuverte !== null) {
          this.sidebarOuverte = sidebarOuverte === 'true'
        }
      }
    },

    sauvegarderPreferences() {
      if (process.client) {
        localStorage.setItem('theme-mode', this.themeMode)
        localStorage.setItem('sidebar-ouverte', this.sidebarOuverte.toString())
      }
    },

    setChargementGlobal(chargement: boolean, message: string = '') {
      this.chargementGlobal = chargement
      this.messageChargement = message
    },

    ajouterNotification(notification: Omit<Notification, 'id'>) {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const dureeDefaut = {
        success: 4000,
        info: 5000,
        warning: 6000,
        error: 0 // Les erreurs restent jusqu'à fermeture manuelle
      }

      const nouvelleNotification: Notification = {
        id,
        duree: dureeDefaut[notification.type],
        ...notification
      }

      this.notifications.push(nouvelleNotification)

      if (nouvelleNotification.duree && nouvelleNotification.duree > 0) {
        setTimeout(() => {
          this.supprimerNotification(id)
        }, nouvelleNotification.duree)
      }

      return id
    },

    supprimerNotification(id: string) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index !== -1) {
        this.notifications.splice(index, 1)
      }
    },

    viderNotifications() {
      this.notifications = []
    },

    notifierSucces(titre: string, message?: string) {
      return this.ajouterNotification({
        type: 'success',
        titre,
        message
      })
    },

    notifierErreur(titre: string, message?: string, actions?: Notification['actions']) {
      return this.ajouterNotification({
        type: 'error',
        titre,
        message,
        actions
      })
    },

    notifierAvertissement(titre: string, message?: string) {
      return this.ajouterNotification({
        type: 'warning',
        titre,
        message
      })
    },

    notifierInfo(titre: string, message?: string) {
      return this.ajouterNotification({
        type: 'info',
        titre,
        message
      })
    },

    ouvrirModal(component: string, props?: Record<string, any>, persistent: boolean = false) {
      const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const modal: Modal = {
        id,
        component,
        props,
        persistent
      }

      this.modals.push(modal)
      
      if (process.client) {
        document.body.classList.add('modal-open')
      }

      return id
    },

    fermerModal(id?: string) {
      if (id) {
        const index = this.modals.findIndex(m => m.id === id)
        if (index !== -1) {
          this.modals.splice(index, 1)
        }
      } else {
        this.modals.pop()
      }

      if (this.modals.length === 0 && process.client) {
        document.body.classList.remove('modal-open')
      }
    },

    fermerToutesModals() {
      this.modals = []
      if (process.client) {
        document.body.classList.remove('modal-open')
      }
    },

    confirmer(
      titre: string, 
      message: string, 
      options: {
        labelConfirmer?: string
        labelAnnuler?: string
        typeConfirmer?: 'primary' | 'danger'
      } = {}
    ): Promise<boolean> {
      return new Promise((resolve) => {
        const modalId = this.ouvrirModal('ModalConfirmation', {
          titre,
          message,
          labelConfirmer: options.labelConfirmer || 'Confirmer',
          labelAnnuler: options.labelAnnuler || 'Annuler',
          typeConfirmer: options.typeConfirmer || 'primary',
          onConfirmer: () => {
            this.fermerModal(modalId)
            resolve(true)
          },
          onAnnuler: () => {
            this.fermerModal(modalId)
            resolve(false)
          }
        }, true)
      })
    },

    reset() {
      this.notifications = []
      this.modals = []
      this.sidebarOuverte = false
      this.chargementGlobal = false
      this.messageChargement = ''
    }
  }
})