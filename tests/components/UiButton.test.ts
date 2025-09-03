import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiButton from '~/components/UiButton.vue'

describe('UiButton', () => {
  it('renders with default props', () => {
    const wrapper = mount(UiButton, {
      slots: {
        default: 'Click me'
      }
    })
    
    expect(wrapper.text()).toBe('Click me')
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.classes()).toContain('btn-primary')
  })

  it('applies variant classes correctly', () => {
    const wrapper = mount(UiButton, {
      props: {
        variant: 'secondary'
      },
      slots: {
        default: 'Secondary Button'
      }
    })
    
    expect(wrapper.classes()).toContain('btn-secondary')
  })

  it('applies size classes correctly', () => {
    const wrapper = mount(UiButton, {
      props: {
        size: 'lg'
      },
      slots: {
        default: 'Large Button'
      }
    })
    
    expect(wrapper.classes()).toContain('btn-lg')
  })

  it('handles disabled state', () => {
    const wrapper = mount(UiButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled Button'
      }
    })
    
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('opacity-50')
  })

  it('handles loading state', () => {
    const wrapper = mount(UiButton, {
      props: {
        loading: true
      },
      slots: {
        default: 'Loading Button'
      }
    })
    
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('opacity-75')
    expect(wrapper.text()).toContain('Loading Button')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(UiButton, {
      slots: {
        default: 'Clickable'
      }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted()).toHaveProperty('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(UiButton, {
      props: {
        disabled: true
      },
      slots: {
        default: 'Disabled'
      }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('does not emit click when loading', async () => {
    const wrapper = mount(UiButton, {
      props: {
        loading: true
      },
      slots: {
        default: 'Loading'
      }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('renders with icon when provided', () => {
    const wrapper = mount(UiButton, {
      props: {
        icon: 'ra:ra-heart'
      },
      slots: {
        default: 'With Icon'
      }
    })
    
    expect(wrapper.find('Icon').exists()).toBe(true)
  })

  it('applies custom classes', () => {
    const wrapper = mount(UiButton, {
      props: {
        class: 'custom-class another-class'
      },
      slots: {
        default: 'Custom'
      }
    })
    
    expect(wrapper.classes()).toContain('custom-class')
    expect(wrapper.classes()).toContain('another-class')
  })
})