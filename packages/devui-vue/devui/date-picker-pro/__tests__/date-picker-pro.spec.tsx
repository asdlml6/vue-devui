import { mount } from '@vue/test-utils';
import dayjs from 'dayjs';
import DDatePickerPro from '../src/date-picker-pro';
import { nextTick, ref, getCurrentInstance } from 'vue';
import { useNamespace } from '../../shared/hooks/use-namespace';
import DButton from '../../button/src/button';
import { Locale } from '../../locale';

const ns = useNamespace('date-picker-pro', true);
const baseClass = ns.b();
const pickerPanelClass = ns.e('panel');
const yearListItemClass = ns.em('calendar-panel', 'year-list-item');
const yearActiveClass = ns.e('year-title-active');
const weekHeaderClass = ns.e('table-week-header');
const tableMonthClass = ns.e('table-month');

const noDotNs = useNamespace('date-picker-pro', false);

const inputNs = useNamespace('input', true);

// 因为 jest 不支持 ResizeObserver，需要 mock 实现
window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }));

describe('date-picker-pro test', () => {
  it('date-picker-pro init render', async () => {
    const datePickerProValue = ref('');
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => <DDatePickerPro v-model={datePickerProValue.value} placeholder="请选择日期"></DDatePickerPro>;
      },
    });

    const container = wrapper.find(baseClass);
    expect(container.exists()).toBeTruthy();
    const input = container.find('input');
    expect(input.attributes('placeholder')).toBe('请选择日期');
    await input.trigger('focus');
    await nextTick();
    await nextTick();
    const pickerPanel = container.find(pickerPanelClass);
    expect(pickerPanel.exists()).toBeTruthy();

    const yearActiveItem = pickerPanel.find(yearActiveClass);
    expect(yearActiveItem.exists()).toBeTruthy();
    const weekHeader = pickerPanel.find(weekHeaderClass);
    expect(weekHeader.findAll('td').length).toBe(7);
    const activeTody = pickerPanel.find(ns.e('table-date-today'));
    expect(activeTody.exists()).toBeTruthy();
    wrapper.unmount();
  });

  it('date-picker-pro select date', async () => {
    const datePickerProValue = ref<Date>();
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => <DDatePickerPro v-model={datePickerProValue.value} placeholder="请选择日期"></DDatePickerPro>;
      },
    });
    const container = wrapper.find(baseClass);
    const input = container.find('input');
    await input.trigger('focus');
    await nextTick();
    await nextTick();
    const pickerPanel = container.find(pickerPanelClass);
    expect(pickerPanel.exists()).toBeTruthy();
    const tableMonthItems = pickerPanel.findAll(tableMonthClass);

    const date = new Date();
    const todayIndex = 7 - ((date.getDate() - date.getDay()) % 7) + date.getDate();
    const selectIndex = todayIndex > 20 ? todayIndex - 1 : todayIndex + 1;
    // 虚拟列表 当前面板呈现月为虚拟列表的第二个tableMonthItem
    const monthContentContainer = tableMonthItems[1].find(ns.e('table-month-content'));
    const Items = monthContentContainer.findAll('td');
    await Items[selectIndex].trigger('click');
    expect(dayjs(datePickerProValue.value).format('YYYY/M/D')).toBe(
      `${date.getFullYear()}/${date.getMonth() + 1}/${todayIndex > 20 ? date.getDate() - 1 : date.getDate() + 1}`
    );

    const pickerPanelNew = container.find(pickerPanelClass);
    expect(pickerPanelNew.exists()).toBeFalsy();

    wrapper.unmount();
  });

  it('date-picker-pro v-model test', async () => {
    const datePickerProValue = ref<Date | string>('');
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => <DDatePickerPro v-model={datePickerProValue.value} placeholder="请选择日期"></DDatePickerPro>;
      },
    });

    const container = wrapper.find(baseClass);
    datePickerProValue.value = new Date();
    const input = container.find('input');
    await input.trigger('focus');
    await nextTick();
    await nextTick();
    const pickerPanel = container.find(pickerPanelClass);
    expect(pickerPanel.exists()).toBeTruthy();
    const tableMonthItems = pickerPanel.findAll(tableMonthClass);

    const date = new Date();
    const selectIndex = 7 - ((date.getDate() - date.getDay()) % 7) + date.getDate();
    // 虚拟列表 当前面板呈现月为虚拟列表的第二个tableMonthItem
    const monthContentContainer = tableMonthItems[1].find(ns.e('table-month-content'));
    const Items = monthContentContainer.findAll('td');
    expect(Items[selectIndex].classes().includes(noDotNs.e('table-date-selected'))).toBe(true);

    wrapper.unmount();
  });

  it('date-picker-pro format props', async () => {
    const datePickerProValue = ref<Date | string>('');
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => <DDatePickerPro v-model={datePickerProValue.value} format="YYYY-MM-DD" placeholder="请选择日期"></DDatePickerPro>;
      },
    });

    const container = wrapper.find(baseClass);
    const input = container.find('input');
    await input.trigger('focus');
    await nextTick();
    await nextTick();
    const pickerPanel = container.find(pickerPanelClass);
    expect(pickerPanel.exists()).toBeTruthy();
    const tableMonthItems = pickerPanel.findAll(tableMonthClass);

    const date = new Date();
    const todayIndex = 7 - ((date.getDate() - date.getDay()) % 7) + date.getDate();
    const selectIndex = todayIndex > 20 ? todayIndex - 1 : todayIndex + 1;
    // 虚拟列表 当前面板呈现月为虚拟列表的第二个tableMonthItem
    const monthContentContainer = tableMonthItems[1].find(ns.e('table-month-content'));
    const Items = monthContentContainer.findAll('td');
    await Items[selectIndex].trigger('click');
    const vm = wrapper.vm;
    const inputNew = vm.$el.querySelector('input');
    expect(inputNew.value).toBe(
      `${date.getFullYear()}-${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}-${
        todayIndex > 20 ? date.getDate() - 1 : date.getDate() + 1
      }`
    );

    wrapper.unmount();
  });

  it('date-picker-pro showTime props', async () => {
    const datePickerProValue = ref<Date | string>('');
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => <DDatePickerPro v-model={datePickerProValue.value} showTime={true} placeholder="请选择日期"></DDatePickerPro>;
      },
    });

    const container = wrapper.find(baseClass);
    const input = container.find('input');
    await input.trigger('focus');
    await nextTick();
    await nextTick();
    const pickerPanel = container.find(pickerPanelClass);
    expect(pickerPanel.exists()).toBeTruthy();
    const tableMonthItems = pickerPanel.findAll(tableMonthClass);

    const timePicker = pickerPanel.find(ns.e('panel-time'));
    expect(timePicker.exists()).toBeTruthy();
    const timeUl = timePicker.findAll('.time-ul');
    expect(timeUl[0].element.childElementCount).toBe(24);
    expect(timeUl[1].element.childElementCount).toBe(60);
    expect(timeUl[2].element.childElementCount).toBe(60);

    const date = new Date();
    const todayIndex = 7 - ((date.getDate() - date.getDay()) % 7) + date.getDate();
    const selectIndex = todayIndex > 20 ? todayIndex - 1 : todayIndex + 1;
    // 虚拟列表 当前面板呈现月为虚拟列表的第二个tableMonthItem
    const monthContentContainer = tableMonthItems[1].find(ns.e('table-month-content'));
    const Items = monthContentContainer.findAll('td');
    await Items[selectIndex].trigger('click');
    expect(dayjs(datePickerProValue.value).format('YYYY/M/D hh:mm:ss')).toBe(
      `${date.getFullYear()}/${date.getMonth() + 1}/${todayIndex > 20 ? date.getDate() - 1 : date.getDate() + 1} 12:00:00`
    );

    const liItems = timeUl[0].findAll('.time-li');
    await liItems[3].trigger('click');
    expect(dayjs(datePickerProValue.value).format('YYYY/M/D hh:mm:ss')).toBe(
      `${date.getFullYear()}/${date.getMonth() + 1}/${todayIndex > 20 ? date.getDate() - 1 : date.getDate() + 1} 03:00:00`
    );

    const pickerPanelFooter = container.find(ns.e('panel-footer'));
    const button = pickerPanelFooter.find('button');
    await button.trigger('click');
    const pickerPanelNew = container.find(pickerPanelClass);
    expect(pickerPanelNew.exists()).toBeFalsy();

    wrapper.unmount();
  });
  it('date-picker-pro event toggleChange confirmEvent focus blur', async () => {
    const datePickerProValue = ref<Date | string>('');
    const onToggleChange = jest.fn();
    const onConfirmEvent = jest.fn();
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => (
          <DDatePickerPro
            v-model={datePickerProValue.value}
            onToggleChange={onToggleChange}
            onConfirmEvent={onConfirmEvent}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="请选择日期"></DDatePickerPro>
        );
      },
    });

    const container = wrapper.find(baseClass);
    const input = container.find('input');
    await input.trigger('focus');
    await nextTick();
    await nextTick();
    expect(onToggleChange).toBeCalledTimes(1);
    expect(onFocus).toBeCalledTimes(1);

    const pickerPanel = container.find(pickerPanelClass);
    const tableMonthItems = pickerPanel.findAll(tableMonthClass);
    const date = new Date();
    const todayIndex = 7 - ((date.getDate() - date.getDay()) % 7) + date.getDate();
    const selectIndex = todayIndex > 20 ? todayIndex - 1 : todayIndex + 1;
    // 虚拟列表 当前面板呈现月为虚拟列表的第二个tableMonthItem
    const monthContentContainer = tableMonthItems[1].find(ns.e('table-month-content'));
    const Items = monthContentContainer.findAll('td');
    await Items[selectIndex].trigger('click');
    expect(onConfirmEvent).toBeCalledTimes(1);
    expect(onToggleChange).toBeCalledTimes(2);
    expect(onBlur).toBeCalledTimes(1);

    wrapper.unmount();
  });

  it('date-picker-pro clear date', async () => {
    const datePickerProValue = ref<Date | string>('');
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => <DDatePickerPro v-model={datePickerProValue.value} placeholder="请选择日期"></DDatePickerPro>;
      },
    });
    const date = new Date();
    const container = wrapper.find(baseClass);
    datePickerProValue.value = date;

    await nextTick();
    const vm = wrapper.vm;
    const input = vm.$el.querySelector('input');
    expect(input.value).toBe(
      `${date.getFullYear()}/${date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1}/${date.getDate()}`
    );
    const singlePicker = container.find(ns.e('single-picker'));
    await singlePicker.trigger('mouseover');
    const icon = singlePicker.find(ns.m('icon-visible'));
    expect(icon.exists()).toBeTruthy();
    await icon.trigger('click');
    const inputNew = vm.$el.querySelector('input');
    expect(inputNew.value).toBe('');

    wrapper.unmount();
  });

  it('date-picker-pro size test', async () => {
    const datePickerProValue = ref<Date | string>('');
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => <DDatePickerPro v-model={datePickerProValue.value} size="lg" placeholder="请选择日期"></DDatePickerPro>;
      },
    });
    const container = wrapper.find(baseClass);
    const input = container.find(inputNs.m('lg'));
    expect(input.exists()).toBeTruthy();

    wrapper.unmount();
  });

  it('date-picker-pro rightArea slot', async () => {
    const datePickerProValue = ref<Date | string>('');
    const setDate = (days: number) => {
      datePickerProValue.value = new Date(new Date().getTime() + days * 24 * 3600 * 1000);
    };
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => (
          <DDatePickerPro
            v-model={datePickerProValue.value}
            v-slots={{
              rightArea: () => (
                <ul>
                  <li>
                    <DButton
                      variant="text"
                      color="primary"
                      onClick={() => {
                        setDate(-30);
                      }}>
                      一个月前
                    </DButton>
                  </li>
                </ul>
              ),
            }}
            placeholder="请选择日期"></DDatePickerPro>
        );
      },
    });
    const container = wrapper.find(baseClass);
    const input = container.find('input');
    expect(input.exists()).toBeTruthy();
    await input.trigger('focus');
    await nextTick();
    await nextTick();
    const pickerPanel = container.find(pickerPanelClass);
    const rightArea = pickerPanel.find(ns.e('panel-right-area'));
    expect(rightArea.exists()).toBeTruthy();

    const button = rightArea.find('button');
    expect(button.exists()).toBeTruthy();
    await button.trigger('click');

    await nextTick();
    const vm = wrapper.vm;
    const inputNew = vm.$el.querySelector('input');
    expect(inputNew.value).toBe(dayjs().subtract(30, 'day').format('YYYY/MM/DD'));

    wrapper.unmount();
  });

  it('date-picker-pro footer slot', async () => {
    const datePickerProValue = ref<Date | string>('');
    const setToday = () => {
      datePickerProValue.value = new Date();
    };
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => (
          <DDatePickerPro
            v-model={datePickerProValue.value}
            v-slots={{
              footer: () => (
                <div>
                  <DButton color="primary" onClick={setToday}>
                    今天
                  </DButton>
                </div>
              ),
            }}
            placeholder="请选择日期"></DDatePickerPro>
        );
      },
    });
    const container = wrapper.find(baseClass);
    const input = container.find('input');
    expect(input.exists()).toBeTruthy();
    await input.trigger('focus');
    await nextTick();
    await nextTick();
    const pickerPanel = container.find(pickerPanelClass);
    const footer = pickerPanel.find(ns.e('panel-footer'));
    expect(footer.exists()).toBeTruthy();

    const button = footer.find('button');
    expect(button.exists()).toBeTruthy();
    await button.trigger('click');

    await nextTick();
    const vm = wrapper.vm;
    const inputNew = vm.$el.querySelector('input');
    expect(inputNew.value).toBe(dayjs().format('YYYY/MM/DD'));

    wrapper.unmount();
  });

  it('date-picker-pro calendarRange limitDateRange', async () => {
    const datePickerProValue = ref<Date | string>('');
    const limitDateRange = ref<Date[]>([
      new Date(new Date().getTime() - 24 * 3600 * 1000),
      new Date(new Date().getTime() + 24 * 3600 * 1000),
    ]);
    const year = new Date().getFullYear();
    const calendarRange = [year, year];
    const wrapper = mount({
      setup() {
        const app = getCurrentInstance();
        app.appContext.config.globalProperties.langMessages = ref(Locale.messages());
        return () => (
          <DDatePickerPro
            v-model={datePickerProValue.value}
            calendarRange={calendarRange}
            limitDateRange={limitDateRange.value}
            placeholder="请选择日期"></DDatePickerPro>
        );
      },
    });
    const container = wrapper.find(baseClass);
    expect(container.exists()).toBeTruthy();
    const input = container.find('input');
    await input.trigger('focus');
    await nextTick();
    await nextTick();
    const pickerPanel = container.find(pickerPanelClass);
    expect(pickerPanel.exists()).toBeTruthy();

    const yearListItems = pickerPanel.findAll(yearListItemClass);
    expect(yearListItems.length).toBe(13);
    const weekHeader = pickerPanel.find(weekHeaderClass);
    expect(weekHeader.findAll('td').length).toBe(7);
    const tableMonthItems = pickerPanel.findAll(tableMonthClass);
    expect(tableMonthItems.length).toBe(12);

    const date = new Date();
    const todayIndex = 7 - ((date.getDate() - date.getDay()) % 7) + date.getDate();
    const selectIndex = todayIndex > 20 ? todayIndex - 2 : todayIndex + 2;
    // 虚拟列表 当前面板呈现月为虚拟列表的第二个tableMonthItem
    const monthContentContainer = tableMonthItems[1].find(ns.e('table-month-content'));
    const Items = monthContentContainer.findAll('td');
    expect(Items[selectIndex].classes().includes(noDotNs.e('table-date-disabled'))).toBe(true);
    await Items[selectIndex].trigger('click');
    expect(datePickerProValue.value).toBe('');

    wrapper.unmount();
  });
});
