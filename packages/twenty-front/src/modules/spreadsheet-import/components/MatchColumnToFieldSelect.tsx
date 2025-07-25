import { useState } from 'react';
import { ReadonlyDeep } from 'type-fest';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { getSubFieldOptionKey } from '@/object-record/spreadsheet-import/utils/getSubFieldOptionKey';
import { MatchColumnSelectFieldSelectDropdownContent } from '@/spreadsheet-import/components/MatchColumnSelectFieldSelectDropdownContent';
import { MatchColumnSelectSubFieldSelectDropdownContent } from '@/spreadsheet-import/components/MatchColumnSelectSubFieldSelectDropdownContent';
import { DO_NOT_IMPORT_OPTION_KEY } from '@/spreadsheet-import/constants/DoNotImportOptionKey';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';

interface MatchColumnToFieldSelectProps {
  columnIndex: string;
  onChange: (value: ReadonlyDeep<SelectOption> | null) => void;
  value?: ReadonlyDeep<SelectOption>;
  options: readonly ReadonlyDeep<SelectOption>[];
  suggestedOptions: readonly ReadonlyDeep<SelectOption>[];
  placeholder?: string;
}

const StyledMenuItem = styled(MenuItem)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;
export const MatchColumnToFieldSelect = ({
  onChange,
  value,
  options,
  suggestedOptions,
  placeholder,
  columnIndex,
}: MatchColumnToFieldSelectProps) => {
  const dropdownId = `match-column-select-v2-dropdown-${columnIndex}`;

  const { closeDropdown } = useCloseDropdown();

  const [selectedFieldMetadataItem, setSelectedFieldMetadataItem] =
    useState<FieldMetadataItem | null>(null);

  const handleFieldMetadataItemSelect = (
    selectedFieldMetadataItem: FieldMetadataItem,
  ) => {
    setSelectedFieldMetadataItem(selectedFieldMetadataItem);

    if (!isCompositeFieldType(selectedFieldMetadataItem.type)) {
      const correspondingOption = options.find(
        (option) => option.value === selectedFieldMetadataItem.name,
      );

      if (isDefined(correspondingOption)) {
        setSelectedFieldMetadataItem(null);

        onChange(correspondingOption);
        closeDropdown();
      }
    }
  };

  const handleSubFieldSelect = (subFieldNameSelected: string) => {
    if (!isDefined(selectedFieldMetadataItem)) {
      return;
    }

    const correspondingOption = options.find((option) => {
      const optionKey = getSubFieldOptionKey(
        selectedFieldMetadataItem,
        subFieldNameSelected,
      );

      return option.value === optionKey;
    });

    if (isDefined(correspondingOption)) {
      setSelectedFieldMetadataItem(null);

      onChange(correspondingOption);
      closeDropdown(dropdownId);
    }
  };

  const handleSelectSuggestedOption = (
    selectedSuggestedOption: SelectOption,
  ) => {
    onChange(selectedSuggestedOption);
    closeDropdown(dropdownId);
  };

  const handleDoNotImportSelect = () => {
    if (isDefined(doNotImportOption)) {
      onChange(doNotImportOption);
      closeDropdown(dropdownId);
    }
  };

  const handleClickOutside = () => {
    setSelectedFieldMetadataItem(null);
  };

  const handleSubFieldBack = () => {
    setSelectedFieldMetadataItem(null);
  };

  const handleCancelSelectClick = () => {
    setSelectedFieldMetadataItem(null);
    closeDropdown(dropdownId);
  };

  const doNotImportOption = options.find(
    (option) => option.value === DO_NOT_IMPORT_OPTION_KEY,
  );

  const shouldDisplaySubFieldMetadataItemSelect =
    isDefined(selectedFieldMetadataItem?.type) &&
    isCompositeFieldType(selectedFieldMetadataItem?.type);

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      clickableComponent={
        <StyledMenuItem
          LeftIcon={value?.Icon}
          text={value?.label ?? placeholder ?? ''}
          accent={value?.label ? 'default' : 'placeholder'}
          RightIcon={IconChevronDown}
        />
      }
      dropdownComponents={
        shouldDisplaySubFieldMetadataItemSelect && selectedFieldMetadataItem ? (
          <MatchColumnSelectSubFieldSelectDropdownContent
            fieldMetadataItem={selectedFieldMetadataItem}
            onSubFieldSelect={handleSubFieldSelect}
            options={options}
            onBack={handleSubFieldBack}
          />
        ) : (
          <MatchColumnSelectFieldSelectDropdownContent
            selectedValue={value}
            onSelectFieldMetadataItem={handleFieldMetadataItemSelect}
            onSelectSuggestedOption={handleSelectSuggestedOption}
            onCancelSelect={handleCancelSelectClick}
            onDoNotImportSelect={handleDoNotImportSelect}
            suggestedOptions={suggestedOptions}
          />
        )
      }
      onClickOutside={handleClickOutside}
      isDropdownInModal
    />
  );
};
