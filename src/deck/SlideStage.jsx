import React, { useRef, useEffect, useMemo } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Text,
  Line,
  Path,
  Group,
  Circle,
  Image as KImage,
  Transformer,
} from 'react-konva';
import { buildScene, subjectBox } from './layouts.js';

/* Recursively render a scene node (everything except the interactive subject,
 * which SlideStage handles separately so it can attach a Transformer). */
function renderNode(node, key, grainImage) {
  switch (node.type) {
    case 'rect':
      return (
        <Rect
          key={key}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          fill={node.fill}
          cornerRadius={node.cornerRadius}
          opacity={node.opacity}
          stroke={node.stroke}
          strokeWidth={node.strokeWidth}
          name={node.name}
          listening={node.listening !== false}
        />
      );
    case 'grain':
      return grainImage ? (
        <Rect
          key={key}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          fillPatternImage={grainImage}
          fillPatternRepeat="repeat"
          opacity={node.opacity}
          listening={false}
        />
      ) : null;
    case 'text':
      return (
        <Text
          key={key}
          x={node.x}
          y={node.y}
          text={node.text}
          width={node.width}
          fontFamily={node.fontFamily}
          fontSize={node.fontSize}
          fontStyle={node.fontStyle}
          fill={node.fill}
          align={node.align}
          lineHeight={node.lineHeight}
          letterSpacing={node.letterSpacing}
          listening={node.listening !== false}
          wrap="word"
        />
      );
    case 'line':
      return (
        <Line
          key={key}
          points={node.points}
          stroke={node.stroke}
          strokeWidth={node.strokeWidth}
          lineCap={node.lineCap}
          listening={false}
        />
      );
    case 'path':
      return (
        <Path
          key={key}
          data={node.data}
          x={node.x}
          y={node.y}
          fill={node.fill}
          listening={false}
        />
      );
    case 'circle':
      return (
        <Circle
          key={key}
          x={node.x}
          y={node.y}
          radius={node.radius}
          fill={node.fill}
          stroke={node.stroke}
          strokeWidth={node.strokeWidth}
          listening={false}
        />
      );
    case 'image':
      return (
        <KImage
          key={key}
          image={node.image}
          x={node.x}
          y={node.y}
          width={node.width}
          height={node.height}
          listening={false}
        />
      );
    case 'group':
      return (
        <Group
          key={key}
          x={node.x}
          y={node.y}
          scaleX={node.scaleX}
          scaleY={node.scaleY}
          opacity={node.opacity}
          listening={node.listening !== false}
        >
          {(node.children || []).map((c, i) => renderNode(c, `${key}-${i}`, grainImage))}
        </Group>
      );
    default:
      return null;
  }
}

export default function SlideStage({
  slide,
  canvasW,
  canvasH,
  displayScale = 1,
  grainImage,
  logoImage,
  subjectImage,
  interactive = false,
  selected = false,
  onSelectSubject,
  onDeselect,
  onTransformChange,
  stageRef,
}) {
  const imgRef = useRef(null);
  const trRef = useRef(null);

  const scene = useMemo(
    () => buildScene(slide, canvasW, canvasH, { logoImage }),
    [slide, canvasW, canvasH, logoImage]
  );

  const transform = slide.subject?.transform;
  const box = subjectImage && transform ? subjectBox(transform, subjectImage, canvasW, canvasH) : null;

  // attach/detach transformer
  useEffect(() => {
    if (!interactive) return;
    const tr = trRef.current;
    if (!tr) return;
    if (selected && imgRef.current) {
      tr.nodes([imgRef.current]);
    } else {
      tr.nodes([]);
    }
    tr.getLayer()?.batchDraw();
  }, [selected, interactive, box?.width, box?.height, subjectImage]);

  const handleDragEnd = (e) => {
    const node = e.target;
    onTransformChange?.({
      ...transform,
      cx: node.x() / canvasW,
      cy: node.y() / canvasH,
    });
  };

  const handleTransformEnd = (e) => {
    const node = e.target;
    const aspect = subjectImage.width / subjectImage.height || 1;
    const newHeightPx = Math.abs(node.height() * node.scaleY());
    const newWidthPx = newHeightPx * aspect;
    // reset scale; size is driven by wFrac on next render
    node.scaleX(transform.flipX ? -1 : 1);
    node.scaleY(1);
    onTransformChange?.({
      ...transform,
      cx: node.x() / canvasW,
      cy: node.y() / canvasH,
      wFrac: newWidthPx / canvasW,
    });
  };

  // Build the children list, swapping the {type:'subject'} marker for the
  // actual subject image at the correct z-index.
  const children = [];
  scene.forEach((node, i) => {
    if (node.type === 'subject') {
      if (box && subjectImage) {
        children.push(
          <KImage
            key={`subject-${i}`}
            ref={interactive ? imgRef : undefined}
            image={subjectImage}
            x={box.x + box.width / 2}
            y={box.y + box.height / 2}
            width={box.width}
            height={box.height}
            offsetX={box.width / 2}
            offsetY={box.height / 2}
            scaleX={transform.flipX ? -1 : 1}
            draggable={interactive}
            listening={interactive}
            onMouseDown={interactive ? () => onSelectSubject?.() : undefined}
            onTap={interactive ? () => onSelectSubject?.() : undefined}
            onDragEnd={interactive ? handleDragEnd : undefined}
            onTransformEnd={interactive ? handleTransformEnd : undefined}
          />
        );
      }
    } else {
      children.push(renderNode(node, `n-${i}`, grainImage));
    }
  });

  const handleStageMouseDown = (e) => {
    if (!interactive) return;
    // click on empty / background deselects
    if (e.target === e.target.getStage() || e.target.name() === 'bg') {
      onDeselect?.();
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={canvasW * displayScale}
      height={canvasH * displayScale}
      scaleX={displayScale}
      scaleY={displayScale}
      onMouseDown={handleStageMouseDown}
      onTouchStart={handleStageMouseDown}
      style={{ display: 'block' }}
    >
      <Layer>
        {children}
        {interactive && (
          <Transformer
            ref={trRef}
            rotateEnabled={false}
            keepRatio={true}
            flipEnabled={false}
            enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            anchorStroke="#39FF14"
            anchorFill="#0D0D0D"
            anchorSize={12}
            borderStroke="#39FF14"
            borderDash={[4, 4]}
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 24 ? oldBox : newBox)}
          />
        )}
      </Layer>
    </Stage>
  );
}
