import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUiStore } from '~/stores/ui'

// Mock process.client
Object.defineProperty(globalThis, 'process', {
  value: { client: true }
})

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should initialize with correct default state', () => {
    const store = useUiStore()
    
    expect(store.notifications).toEqual([])
    expect(store.modals).toEqual([])
    expect(store.sidebarOuverte).toBe(false)
    expect(store.themeMode).toBe('auto')
    expect(store.chargementGlobal).toBe(false)
    expect(store.messageChargement).toBe('')
  })

  it('should toggle sidebar correctly', () => {
    const store = useUiStore()
    
    expect(store.sidebarOuverte).toBe(false)
    
    store.toggleSidebar()
    expect(store.sidebarOuverte).toBe(true)
    
    store.toggleSidebar()
    expect(store.sidebarOuverte).toBe(false)
  })

  it('should set sidebar state directly', () => {
    const store = useUiStore()
    
    store.setSidebarOuverte(true)
    expect(store.sidebarOuverte).toBe(true)
    
    store.setSidebarOuverte(false)
    expect(store.sidebarOuverte).toBe(false)
  })

  it('should set theme mode and persist to localStorage', () => {
    const store = useUiStore()
    
    store.setThemeMode('dark')
    expect(store.themeMode).toBe('dark')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-mode', 'dark')
  })

  it('should handle global loading state', () => {
    const store = useUiStore()
    
    store.setChargementGlobal(true, 'Chargement en cours...')
    expect(store.chargementGlobal).toBe(true)
    expect(store.messageChargement).toBe('Chargement en cours...')
    
    store.setChargementGlobal(false)
    expect(store.chargementGlobal).toBe(false)
    expect(store.messageChargement).toBe('')
  })

  it('should add notifications correctly', () => {
    const store = useUiStore()
    
    const notificationId = store.ajouterNotification({
      type: 'success',
      titre: 'Succès',
      message: 'Opération réussie'
    })
    
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0]).toMatchObject({
      id: notificationId,
      type: 'success',
      titre: 'Succès',
      message: 'Opération réussie'
    })
  })

  it('should remove notifications', () => {
    const store = useUiStore()
    
    const id1 = store.ajouterNotification({ type: 'success', titre: 'Test 1' })
    const id2 = store.ajouterNotification({ type: 'error', titre: 'Test 2' })
    
    expect(store.notifications).toHaveLength(2)
    
    store.supprimerNotification(id1)
    expect(store.notifications).toHaveLength(1)
    expect(store.notifications[0].id).toBe(id2)
  })

  it('should clear all notifications', () => {
    const store = useUiStore()
    
    store.ajouterNotification({ type: 'success', titre: 'Test 1' })
    store.ajouterNotification({ type: 'error', titre: 'Test 2' })
    
    expect(store.notifications).toHaveLength(2)
    
    store.viderNotifications()
    expect(store.notifications).toHaveLength(0)
  })

  it('should provide convenience methods for different notification types', () => {
    const store = useUiStore()
    
    store.notifierSucces('Succès', 'Message de succès')
    store.notifierErreur('Erreur', 'Message d\'erreur')
    store.notifierAvertissement('Attention', 'Message d\'avertissement')
    store.notifierInfo('Info', 'Message d\'info')
    
    expect(store.notifications).toHaveLength(4)
    expect(store.notifications[0].type).toBe('success')
    expect(store.notifications[1].type).toBe('error')
    expect(store.notifications[2].type).toBe('warning')
    expect(store.notifications[3].type).toBe('info')
  })

  it('should handle modals correctly', () => {
    const store = useUiStore()
    
    const modalId = store.ouvrirModal('TestComponent', { prop1: 'value1' })
    
    expect(store.modals).toHaveLength(1)
    expect(store.modalActive).toMatchObject({
      id: modalId,
      component: 'TestComponent',
      props: { prop1: 'value1' }
    })
  })

  it('should close modals correctly', () => {
    const store = useUiStore()
    
    const modalId1 = store.ouvrirModal('Modal1')
    const modalId2 = store.ouvrirModal('Modal2')
    
    expect(store.modals).toHaveLength(2)
    
    store.fermerModal(modalId1)
    expect(store.modals).toHaveLength(1)
    expect(store.modalActive?.id).toBe(modalId2)
  })

  it('should close last modal when no id provided', () => {
    const store = useUiStore()
    
    store.ouvrirModal('Modal1')
    store.ouvrirModal('Modal2')
    
    expect(store.modals).toHaveLength(2)
    
    store.fermerModal() // No ID provided, should close last
    expect(store.modals).toHaveLength(1)
  })

  it('should close all modals', () => {
    const store = useUiStore()
    
    store.ouvrirModal('Modal1')
    store.ouvrirModal('Modal2')
    
    expect(store.modals).toHaveLength(2)
    
    store.fermerToutesModals()
    expect(store.modals).toHaveLength(0)
  })

  it('should provide getters for filtered notifications', () => {
    const store = useUiStore()
    
    store.ajouterNotification({ type: 'success', titre: 'Succès 1' })
    store.ajouterNotification({ type: 'success', titre: 'Succès 2' })
    store.ajouterNotification({ type: 'error', titre: 'Erreur 1' })
    
    expect(store.nombreNotifications).toBe(3)
    expect(store.notificationsParType('success')).toHaveLength(2)
    expect(store.notificationsParType('error')).toHaveLength(1)
    expect(store.notificationsParType('warning')).toHaveLength(0)
  })
})