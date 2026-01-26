import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { getVolumeColor, SVG_MUSCLE_GROUPS, CSV_TO_SVG_MUSCLE_MAP } from './utils/muscle/muscleMapping';
import { INTERACTIVE_MUSCLE_IDS } from './utils/muscle/muscleMappingConstants';
import MaleFrontBodyMapMuscle from './muscles/MaleFrontBodyMapMuscle';
import MaleBackBodyMapMuscle from './muscles/MaleBackBodyMapMuscle';
import MaleFrontBodyMapGroup from './groups/MaleFrontBodyMapGroup';
import MaleBackBodyMapGroup from './groups/MaleBackBodyMapGroup';
import FemaleFrontBodyMapMuscle from './muscles/FemaleFrontBodyMapMuscle';
import FemaleBackBodyMapMuscle from './muscles/FemaleBackBodyMapMuscle';
import FemaleFrontBodyMapGroup from './groups/FemaleFrontBodyMapGroup';
import FemaleBackBodyMapGroup from './groups/FemaleBackBodyMapGroup';

export type BodyMapGender = 'male' | 'female';
export type BodyMapViewMode = 'muscle' | 'group';

interface BodyMapProps {
  onPartClick: (muscleGroup: string) => void;
  selectedPart: string | null;
  selectedMuscleIdsOverride?: string[];
  hoveredMuscleIdsOverride?: string[];
  muscleVolumes: Map<string, number>;
  maxVolume?: number;
  onPartHover?: (muscleGroup: string | null, e?: MouseEvent) => void;
  compact?: boolean;
  compactFill?: boolean;
  interactive?: boolean;
  gender?: BodyMapGender;
  viewMode?: BodyMapViewMode;
  side?: 'front' | 'back' | 'both';
}

// Hover and selection highlight colors (theme-driven)
const HOVER_HIGHLIGHT = 'hsl(var(--primary) / 0.6)';
const SELECTION_HIGHLIGHT = 'hsl(var(--primary) / 0.9)';

const INTERACTIVE_MUSCLES: readonly string[] = INTERACTIVE_MUSCLE_IDS;

// Parts that are visually colored but not interactive (no hover/click)
const READ_ONLY_PARTS = ['feet', 'hands', 'groin'];

const getRelatedMuscleIds = (muscleGroup: string | null): string[] => {
  if (!muscleGroup) return [];
  const groupName = SVG_MUSCLE_GROUPS[muscleGroup];
  if (!groupName) return [muscleGroup];
  const relatedIds: string[] = [];
  for (const [csvMuscle, svgIds] of Object.entries(CSV_TO_SVG_MUSCLE_MAP)) {
    if (csvMuscle === groupName) relatedIds.push(...svgIds);
  }
  return relatedIds.length > 0 ? relatedIds : [muscleGroup];
};

export const BodyMap: React.FC<BodyMapProps> = ({
  onPartClick,
  selectedPart,
  selectedMuscleIdsOverride,
  hoveredMuscleIdsOverride,
  muscleVolumes,
  maxVolume = 1,
  onPartHover,
  compact = false,
  compactFill = false,
  interactive = false,
  gender = 'male',
  viewMode = 'muscle',
  side = 'both',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredMuscleRef = useRef<string | null>(null);
  const selectedMuscleIds = useMemo(
    () => selectedMuscleIdsOverride ?? getRelatedMuscleIds(selectedPart),
    [selectedMuscleIdsOverride, selectedPart]
  );

  const applyColors = useCallback((hoveredId: string | null = null) => {
    if (!containerRef.current) return;
    INTERACTIVE_MUSCLES.forEach(muscleId => {
      // Use attribute selector [id=...] to ensure we select duplicate IDs (e.g. feet/hands in both front/back views)
      const elements = containerRef.current?.querySelectorAll(`[id="${muscleId}"]`);
      elements?.forEach(el => {
        const volume = muscleVolumes.get(muscleId) || 0;
        const color = getVolumeColor(volume, maxVolume);

        // Disable interaction for specific parts
        const isReadOnly = READ_ONLY_PARTS.includes(muscleId);

        const isSelected = !isReadOnly && selectedMuscleIds.includes(muscleId);
        const isHovered = !isReadOnly && (hoveredMuscleIdsOverride
          ? hoveredMuscleIdsOverride.includes(muscleId)
          : (hoveredId === muscleId || (hoveredId && getRelatedMuscleIds(hoveredId).includes(muscleId))));

        el.querySelectorAll('path').forEach(path => {
          path.style.transition = 'all 0.15s ease';
          // Use theme variable for stroke to support light/dark mode
          path.style.stroke = 'hsl(var(--foreground))';
          path.style.strokeWidth = compact ? '0.6' : '1';
          path.style.strokeOpacity = compact ? '0.55' : '0.3';

          if (isSelected) {
            // Selected state
            path.style.fill = SELECTION_HIGHLIGHT;
            path.style.filter = 'brightness(1.2)';
          } else if (isHovered) {
            // Hover state
            path.style.fill = HOVER_HIGHLIGHT;
            path.style.filter = 'brightness(1.1)';
          } else {
            // Default state - volume-based color
            path.style.fill = color;
            path.style.filter = '';
          }
        });
        (el as HTMLElement).style.cursor = (compact && !interactive) || isReadOnly ? 'default' : 'pointer';
      });
    });
  }, [muscleVolumes, maxVolume, selectedMuscleIds, hoveredMuscleIdsOverride, interactive, compact]);

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    const muscleGroup = target.closest('g[id]');
    if (muscleGroup && INTERACTIVE_MUSCLES.includes(muscleGroup.id) && !READ_ONLY_PARTS.includes(muscleGroup.id)) {
      onPartClick(muscleGroup.id);
    }
  }, [onPartClick]);

  const handleMouseOver = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    const muscleGroup = target.closest('g[id]');
    if (muscleGroup && INTERACTIVE_MUSCLES.includes(muscleGroup.id) && !READ_ONLY_PARTS.includes(muscleGroup.id)) {
      const hoveredId = muscleGroup.id;
      hoveredMuscleRef.current = hoveredId;
      if (!hoveredMuscleIdsOverride) {
        applyColors(hoveredId);
      }
      onPartHover?.(hoveredId, e);
    }
  }, [onPartHover, applyColors, hoveredMuscleIdsOverride]);

  const handleMouseOut = useCallback((e: MouseEvent) => {
    hoveredMuscleRef.current = null;
    if (!hoveredMuscleIdsOverride) {
      applyColors(null);
    }
    onPartHover?.(null, e);
  }, [onPartHover, applyColors, hoveredMuscleIdsOverride]);

  useEffect(() => {
    applyColors(hoveredMuscleRef.current);
    const container = containerRef.current;
    if (!container) return;
    if (compact && !interactive) return;

    // Define listeners
    const onClick = (e: Event) => handleClick(e as MouseEvent);
    const onMouseOver = (e: Event) => handleMouseOver(e as MouseEvent);
    const onMouseOut = (e: Event) => handleMouseOut(e as MouseEvent);

    container.addEventListener('click', onClick);
    container.addEventListener('mouseover', onMouseOver);
    container.addEventListener('mouseout', onMouseOut);
    return () => {
      container.removeEventListener('click', onClick);
      container.removeEventListener('mouseover', onMouseOver);
      container.removeEventListener('mouseout', onMouseOut);
    };
  }, [applyColors, handleClick, handleMouseOver, handleMouseOut, compact, interactive]);

  const svgClass = compact ? (compactFill ? 'h-full w-auto' : 'h-28 w-auto') : 'h-[50vh] md:h-[60vh] w-auto my-4';

  const FrontSvg = gender === 'female'
    ? (viewMode === 'group' ? FemaleFrontBodyMapGroup : FemaleFrontBodyMapMuscle)
    : (viewMode === 'group' ? MaleFrontBodyMapGroup : MaleFrontBodyMapMuscle);

  const BackSvg = gender === 'female'
    ? (viewMode === 'group' ? FemaleBackBodyMapGroup : FemaleBackBodyMapMuscle)
    : (viewMode === 'group' ? MaleBackBodyMapGroup : MaleBackBodyMapMuscle);

  return (
    <div
      ref={containerRef}
      className={`flex justify-center items-center ${compact ? 'gap-0' : 'gap-4'} w-full ${compactFill ? 'h-full' : ''}`}
    >
      {(side === 'both' || side === 'front') && <FrontSvg className={svgClass} />}
      {(side === 'both' || side === 'back') && <BackSvg className={svgClass} />}
    </div>
  );
};
