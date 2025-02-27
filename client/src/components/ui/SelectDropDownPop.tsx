import React, { useState } from 'react';
import { Root, Trigger, Content, Portal } from '@radix-ui/react-popover';
import MenuItem from '~/components/Chat/Menus/UI/MenuItem';
import type { Option } from '~/common';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils/';
import { useMultiSearch } from './MultiSearch';
import { shouldShowProBadge, getModelDisplayName, isModelLegacy } from '~/data/modelConfig';
import ProBadge, { proBadgeStyles } from './ProBadge';

type SelectDropDownProps = {
  id?: string;
  title?: string;
  value: string | null | Option;
  disabled?: boolean;
  setValue: (value: string) => void;
  availableValues: string[] | Option[];
  emptyTitle?: boolean;
  showAbove?: boolean;
  showLabel?: boolean;
  iconSide?: 'left' | 'right';
  renderOption?: () => React.ReactNode;
};

// Legacy styling with more pronounced visual treatment
const legacyStyles = 'opacity-60 italic text-gray-400 dark:text-gray-500 border-l-2 border-gray-300 dark:border-gray-600 pl-2';

function SelectDropDownPop({
  title: _title,
  value,
  availableValues,
  setValue,
  showAbove = false,
  showLabel = true,
  emptyTitle = false,
}: SelectDropDownProps) {
  const [open, setOpen] = useState(false);
  const localize = useLocalize();
  const transitionProps = { className: 'top-full mt-3' };
  if (showAbove) {
    transitionProps.className = 'bottom-full mb-3';
  }

  let title = _title;

  if (emptyTitle) {
    title = '';
  } else if (!title) {
    title = localize('com_ui_model');
  }

  // Detemine if we should to convert this component into a searchable select.  If we have enough elements, a search
  // input will appear near the top of the menu, allowing correct filtering of different model menu items. This will
  // reset once the component is unmounted (as per a normal search)
  const [filteredValues, searchRender] = useMultiSearch<string[] | Option[]>({
    availableOptions: availableValues,
  });
  const hasSearchRender = Boolean(searchRender);
  const options = hasSearchRender ? filteredValues : availableValues;

  const currentValue = typeof value !== 'string' && value ? value.label ?? '' : value ?? '';
  const showBadge = shouldShowProBadge(String(currentValue));
  const isLegacy = isModelLegacy(String(currentValue));

  return (
    <Root open={open} onOpenChange={setOpen}>
      <div className={'flex items-center justify-center gap-2 '}>
        <div className={'relative w-full'}>
          <Trigger asChild>
            <button
              data-testid="select-dropdown-button"
              className={cn(
                'pointer-cursor relative flex flex-col rounded-lg border border-black/10 bg-white py-2 pl-3 pr-10 text-left focus:ring-0 focus:ring-offset-0 dark:border-gray-700 dark:bg-gray-800 sm:text-sm',
                'hover:bg-gray-50 radix-state-open:bg-gray-50 dark:hover:bg-gray-700 dark:radix-state-open:bg-gray-700',
              )}
              aria-label={`Select ${title}`}
              aria-haspopup="false"
            >
              {' '}
              {showLabel && (
                <label className="block text-xs text-gray-700 dark:text-gray-500 ">{title}</label>
              )}
              <span className="inline-flex w-full items-center gap-1.5">
                <span
                  className={cn(
                    'flex h-6 items-center gap-1 text-sm text-gray-800 dark:text-white',
                    !showLabel ? 'text-xs' : '',
                    'min-w-[75px] font-normal',
                    isLegacy && 'text-gray-400 dark:text-gray-500'
                  )}
                >
                  {getModelDisplayName(currentValue)}
                </span>
                {showBadge && <ProBadge className="ml-2" />}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4  text-gray-400"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                  style={showAbove ? { transform: 'scaleY(-1)' } : {}}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </span>
            </button>
          </Trigger>
          <Portal>
            <Content
              side="bottom"
              align="start"
              className={cn(
                'mt-2 max-h-[52vh] min-w-full overflow-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-700 dark:text-white lg:max-h-[52vh]',
                hasSearchRender && 'relative',
              )}
            >
              {searchRender}
              {options.map((option) => {
                const optionValue = typeof option !== 'string' ? option.label ?? '' : option;
                const showOptionBadge = shouldShowProBadge(String(optionValue));
                const isOptionLegacy = isModelLegacy(String(optionValue));
                return (
                  <MenuItem
                    key={option}
                    title={getModelDisplayName(typeof option === 'string' ? option : option.label ?? '')}
                    value={option}
                    selected={!!(value && value === option)}
                    onClick={() => {
                      setValue(option);
                      setOpen(false);
                    }}
                    badge={showOptionBadge ? 'PRO' : undefined}
                    badgeClassName={showOptionBadge ? proBadgeStyles : undefined}
                    className={cn(
                      isOptionLegacy && legacyStyles
                    )}
                  />
                );
              })}
            </Content>
          </Portal>
        </div>
      </div>
    </Root>
  );
}

export default SelectDropDownPop;
