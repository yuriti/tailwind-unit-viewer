<template lang="html">
    <div class="tw-container tw-pb-60 tw-pt-12">
        <div class="tw-flex">
            <div class="tw-text-sm tw-opacity-60 tw-font-medium">tailwind version: {{ tailwindVersion }}</div>
        </div>
        <div class="tw-mt-12 tw-flex tw-items-center tw-justify-center tw-h-[20rem]">
            <div class="tw-flex tw-space-x-6">
                <div class="tw-cursor-text tw-relative tw-flex tw-items-center tw-border tw-border-[#DEDEDE] tw-pr-4">
                    <label class="tw-flex tw-px-4 tw-py-3">
                        <input v-model="input"
                               ref="source"
                               class="tw-w-[16rem] tw-text-center tw-text-3xl tw-font-medium tw-text-black"
                               placeholder=""
                               autofocus
                               @focus="onFocus"
                               @blur="onBlur"
                        />
                    </label>
                    <div class="tw-cursor-text tw-pointer-events-none tw-absolute tw-text-base tw-font-bold tw-right-4">
                        PX
                    </div>
                </div>
                <div class="tw-cursor-text tw-relative tw-flex tw-items-center tw-border tw-border-[#DEDEDE] tw-pr-4">
                    <label class="tw-flex tw-px-4 tw-py-3">
                        <input v-model.number="output"
                               class="tw-w-[16rem] tw-text-center tw-text-3xl tw-font-medium tw-text-[#1a79ff]"
                               placeholder=""
                               @focus="onFocus"
                               @blur="onBlur"
                        />
                    </label>
                    <div class="tw-cursor-text tw-pointer-events-none tw-absolute tw-text-base tw-font-bold tw-right-4">
                        REM
                    </div>
                </div>
            </div>
        </div>
        <div class="tw-mt-12 tw-space-y-12">
            <div
                v-for="({items, key}, index) in items"
                :key="'item' + index"
                class="tw-flex tw-flex-col tw-w-full tw-border-b tw-border-[#DEDEDE]">
                <div class="tw-font-bold tw-text-xl tw-capitalize">{{ key }}</div>
                <div class="tw-flex tw-flex-col tw-mt-2">
                    <div v-for="(item, _index) in items"
                         :key="'item' + index + 'child' + _index"
                         :ref="el => select === item.id ? onSelect(el, item.id, item.text) : null"
                         class="tw-w-full tw-flex tw-px-4 tw-py-4 hover:tw-bg-[#EDEDED] tw-cursor-pointer"
                         :class="{'tw-bg-[#EDEDED]': select === item.id}"
                         @click="onCopy(item.id, item.text)"
                    >
                        <div class="tw-font-semibold tw-text-base tw-tracking-wider">
                            {{ item.text }}
                        </div>
                        <div class="tw-ml-6 tw-font-medium tw-text-base tw-opacity-50" v-if="item.style">
                            {{ item.style }}
                        </div>
                        <div v-if="copy === item.id" class="tw-ml-auto tw-font-medium tw-text-base">Copied!</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import tailwindConfig from '../tailwind.config';
import config from '../config.json';
import packageConfig from '../package.json';
import tailwindResolveConfig from 'tailwindcss/resolveConfig';
import {defineComponent, onMounted, Ref, ref, watch} from "vue";

export default defineComponent({
    name: "viewer",
    setup() {
        const tailwind: { theme: any } = tailwindResolveConfig(tailwindConfig);
        const theme = tailwind.theme;
        const increment = ref(-1);
        const copy = ref(-1);
        const select = ref(-1);
        const selectKey = ref(null) as Ref<string | null>;
        const input = ref(null) as Ref<null | number | string>;
        const source = ref() as Ref<HTMLInputElement>;
        const output = ref(null) as Ref<number | null>;
        const items = ref([]) as Ref<Record<string, unknown>[]>;
        const baseFontSize = 16;
        const isFocusInput = ref(false) as Ref<boolean>;

        const keys = Object.keys(config);

        const copyText = (text: string) => navigator.clipboard.writeText(text);

        // Selected
        watch(() => select.value > -1, (value) => {
            if (!value) {
                selectKey.value = null;
                copy.value = -1;
            }
        });

        // Input change
        watch(() => input.value, () => {
            if (input.value === null) {
                return;
            }

            items.value = [];
            increment.value = -1;
            select.value = -1;
            copy.value = -1;

            const match = String(input.value).match(/-?[0-9]?[0-9,.]+/) as Array<string>;
            const search = String(input.value).match(/[a-z-]+/i);

            try {
                output.value = Number(Number(Number(match[0]) / baseFontSize).toFixed(3));
            } catch (e) {
                output.value = null;
                return;
            }

            copyText(String(output.value) + 'rem');

            items.value = Object.keys(theme)
                .filter(key => keys.includes(key))
                .sort((a, b) => keys.indexOf(a) - keys.indexOf(b))
                .flatMap(key => {
                    const data = (config[key] || []) as { prefix: string, style: string }[]
                    // const data: Array<{ prefix: string, style: string }> = [];

                    //
                    // switch (key) {
                    //     case 'borderRadius':
                    //         data.push({
                    //             prefix: 'rounded',
                    //             style: 'border-radius: ::value::'
                    //         });
                    //         break;
                    //     case 'margin':
                    //         data.push({
                    //             prefix: 'm',
                    //             style: 'margin: ::value::'
                    //         }, {
                    //             prefix: 'mr',
                    //             style: 'margin-right: ::value::'
                    //         }, {
                    //             prefix: 'ml',
                    //             style: 'margin-left: ::value::'
                    //         }, {
                    //             prefix: 'mt',
                    //             style: 'margin-top: ::value::'
                    //         }, {
                    //             prefix: 'mb',
                    //             style: 'margin-bottom: ::value::'
                    //         });
                    //         break;
                    //     case 'padding':
                    //         data.push({
                    //             prefix: 'p',
                    //             style: 'padding: ::value::'
                    //         }, {
                    //             prefix: 'px',
                    //             style: 'padding-left: ::value:: padding-right: ::value::'
                    //         }, {
                    //             prefix: 'py',
                    //             style: 'padding-top: ::value:: padding-bottom: ::value::'
                    //         }, {
                    //             prefix: 'pr',
                    //             style: 'padding-right: ::value::'
                    //         }, {
                    //             prefix: 'pl',
                    //             style: 'padding-left: ::value::'
                    //         }, {
                    //             prefix: 'pt',
                    //             style: 'padding-top: ::value::'
                    //         }, {
                    //             prefix: 'pb',
                    //             style: 'padding-bottom: ::value::'
                    //         });
                    //         break;
                    //     case 'lineHeight':
                    //         data.push({
                    //             prefix: 'leading',
                    //             style: 'line-height: ::value::'
                    //         });
                    //         break;
                    //     case 'fontSize':
                    //         data.push({
                    //             prefix: 'text',
                    //             style: 'font-size: ::value::',
                    //         });
                    //         break;
                    //     case 'translate':
                    //         data.push({
                    //             prefix: 'translate-x',
                    //             style: 'transform: translateX(::value::)'
                    //         }, {
                    //             prefix: 'translate-y',
                    //             style: 'transform: translateY(::value::)'
                    //         })
                    //         break;
                    //     case 'width':
                    //         data.push({
                    //             prefix: 'w',
                    //             style: 'width: ::value::'
                    //         });
                    //         break;
                    //     case 'height':
                    //         data.push({
                    //             prefix: 'h',
                    //             style: 'height: ::value::'
                    //         });
                    //         break;
                    // }

                    let items: Array<any> = Object.keys(theme[key])
                        .filter(_key => {
                            const _value = theme[key][_key];

                            switch (typeof _value) {
                                case 'string':
                                    return _value.endsWith('rem') && Number(_value.slice(0, -3)) === output.value;
                                case 'object':
                                    return Array.isArray(_value) && typeof _value[0] === 'string'
                                        ? Number(_value[0].slice(0, -3)) === output.value
                                        : false;
                            }

                            return false;
                        });

                    if (!items.length) {
                        items.push('[' + output.value + 'rem]');
                    }

                    items = items.flatMap(key => {
                        return data
                            .filter(({prefix}) => search && search[0] ? prefix.includes(search[0].toLowerCase()) : true)
                            .map(({prefix, style}) => {
                                let _key = key;

                                if (_key.startsWith('-')) {
                                    prefix = '-' + prefix;
                                    _key = _key.slice(1);
                                }

                                return {
                                    id: ++increment.value,
                                    text: 'tw-' + prefix + '-' + _key,
                                    style: style.replaceAll('::value::', (String(match[0]) || 'NaN') + 'px') + ' / ' + style.replaceAll('::value::', (String(output.value) || 'NaN') + 'rem')
                                };
                            })
                    });

                    return [{
                        key,
                        items: items
                    }];
                });
        });

        onMounted(() => {
            document.addEventListener('keydown', function (e) {
                switch (e.key) {
                    case 'ArrowDown':
                        if (isFocusInput.value) {
                            console.log('foucs');
                            source.value?.focus();
                            source.value?.blur();
                        }

                        select.value = Math.min(select.value + 1, increment.value);
                        break;
                    case 'ArrowUp':
                        if (select.value <= 0) {
                            source.value?.focus();
                            select.value = -1;
                        } else {
                            select.value = Math.max(select.value - 1, 0);
                        }
                        break;
                    case 'Enter':
                        if (select.value > -1) {
                            if (selectKey.value) {
                                copy.value = select.value;
                                copyText(selectKey.value);
                            }
                        } else {
                            source.value?.focus();
                            source.value?.blur();
                            copy.value = -1;
                            select.value = 0;
                        }
                        break;
                    case 'Escape':
                        select.value = -1;
                        source.value?.focus();
                        source.value?.select();
                        window.scrollTo({top: 0});
                        break;
                }
            })
        });

        return {
            tailwindVersion: packageConfig.dependencies["tailwindcss"],
            copy,
            select,
            source,
            input,
            output,
            items,
            onFocus: () => {
                isFocusInput.value = true;
                select.value = -1;
            },
            onBlur: () => {
                isFocusInput.value = false;
            },
            onSelect: (el: HTMLElement, id: number, text: string) => {
                window.scrollTo({top: el.offsetTop - (window.innerHeight / 2)});

                selectKey.value = text;
            },
            onCopy: (id: number, text: string) => {
                select.value = id;
                copy.value = id;
                copyText(text);
            }
        }
    }
})
</script>
