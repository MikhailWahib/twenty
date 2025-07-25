import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';

import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { RecordInlineCellValue } from '@/object-record/record-inline-cell/components/RecordInlineCellValue';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';

import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/types/guards/isFieldText';
import { RecordInlineCellCloseOnCommandMenuOpeningEffect } from '@/object-record/record-inline-cell/components/RecordInlineCellCloseOnCommandMenuOpeningEffect';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import {
  AppTooltip,
  OverflowingTextWithTooltip,
  TooltipDelay,
} from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useRecordInlineCellContext } from './RecordInlineCellContext';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  width: 16px;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
    width: 16px;
  }
`;

const StyledLabelAndIconContainer = styled.div`
  align-items: center;
  align-self: flex-start;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: 24px;
`;

const StyledValueContainer = styled.div<{ readonly: boolean }>`
  display: flex;
  min-width: 0;
  position: relative;

  &:hover {
    ${({ readonly, theme }) =>
      readonly &&
      `
      outline: 1px solid ${theme.border.color.medium};
      border-radius: ${theme.border.radius.sm};
      
      ${StyledIconContainer}, ${StyledLabelContainer} {
        color: ${theme.font.color.secondary};
      }
      
      img {
        opacity: 0.64;
      }
    `}
  }
`;

const StyledLabelContainer = styled.div<{ width?: number }>`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  width: ${({ width }) => width}px;
`;

const StyledInlineCellBaseContainer = styled.div<{ readonly: boolean }>`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  height: fit-content;
  gap: ${({ theme }) => theme.spacing(1)};
  user-select: none;
  align-items: center;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
`;

export const StyledSkeletonDiv = styled.div`
  height: 24px;
`;

export const RecordInlineCellContainer = () => {
  const {
    readonly,
    IconLabel,
    label,
    labelWidth,
    showLabel,
    editModeContentOnly,
  } = useRecordInlineCellContext();

  const { isInlineCellInEditMode, openInlineCell } = useInlineCell();

  const { recordId, fieldDefinition } = useContext(FieldContext);

  const shouldContainerBeClickable =
    !readonly && !editModeContentOnly && !isInlineCellInEditMode;

  if (isFieldText(fieldDefinition)) {
    assertFieldMetadata(FieldMetadataType.TEXT, isFieldText, fieldDefinition);
  }

  const { setIsFocused } = useFieldFocus();

  const handleContainerMouseEnter = () => {
    if (!readonly) {
      setIsFocused(true);
    }
  };

  const handleContainerMouseLeave = () => {
    if (!readonly) {
      setIsFocused(false);
    }
  };

  const theme = useTheme();
  const labelId = `label-${getRecordFieldInputId(
    recordId,
    fieldDefinition?.metadata?.fieldName,
  )}`;

  return (
    <StyledInlineCellBaseContainer
      readonly={readonly ?? false}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
      onClick={shouldContainerBeClickable ? openInlineCell : undefined}
    >
      {(IconLabel || label) && (
        <StyledLabelAndIconContainer id={labelId}>
          {IconLabel && (
            <StyledIconContainer>
              <IconLabel stroke={theme.icon.stroke.sm} />
            </StyledIconContainer>
          )}
          {showLabel && label && (
            <StyledLabelContainer width={labelWidth}>
              <OverflowingTextWithTooltip text={label} displayedMaxRows={1} />
            </StyledLabelContainer>
          )}
          {/* TODO: Displaying Tooltips on the board is causing performance issues https://react-tooltip.com/docs/examples/render */}
          {!showLabel && !fieldDefinition?.disableTooltip && (
            <AppTooltip
              anchorSelect={`#${labelId}`}
              content={label}
              clickable
              noArrow
              place="bottom"
              positionStrategy="fixed"
              delay={TooltipDelay.shortDelay}
            />
          )}
        </StyledLabelAndIconContainer>
      )}
      {isInlineCellInEditMode && (
        <RecordInlineCellCloseOnCommandMenuOpeningEffect />
      )}
      <StyledValueContainer readonly={readonly ?? false}>
        <RecordInlineCellValue />
      </StyledValueContainer>
    </StyledInlineCellBaseContainer>
  );
};
