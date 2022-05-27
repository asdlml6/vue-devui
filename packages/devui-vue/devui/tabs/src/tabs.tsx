import { defineComponent, provide, reactive, SetupContext } from 'vue';
import { TabsData, tabsProps, TabsState, TabsProps } from './tabs-types';
import { useNamespace } from '../../shared/hooks/use-namespace';
import './tabs.scss';
import TabNav from './components/tab-nav/tab-nav';
import { useTabsEvent } from './use-tabs';

export default defineComponent({
  name: 'DTabs',
  props: tabsProps,
  emits: ['update:modelValue', 'active-tab-change', 'tab-remove'],
  setup(props: TabsProps, ctx: SetupContext) {
    const ns = useNamespace('tabs');
    const state: TabsState = reactive({
      data: [],
      active: props.modelValue,
      showContent: props.showContent,
      slots: [],
    });
    provide<TabsData>('tabs', { state });

    const { onUpdateModelValue, onActiveTabChange, onTabRemove } = useTabsEvent(ctx);
    const handleTabAdd = () => {
      console.log('handleTabAdd');
    };

    return () => {
      const newButton = props.addable ? (
        <span class={ns.e('new-tab')} onClick={handleTabAdd}>
          <d-icon name="add"></d-icon>
        </span>
      ) : null;
      return (
        <div class={ns.b()}>
          {newButton}
          <TabNav {...props} onUpdate:modelValue={onUpdateModelValue} onActiveTabChange={onActiveTabChange} onTabRemove={onTabRemove} />
          {ctx.slots.default?.()}
        </div>
      );
    };
  },
});
