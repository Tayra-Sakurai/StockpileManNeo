/**
 * @fileoverview Audio visualizer component for Gemini Live talking session.
 * @author Tayra Sakurai <tayra_sakurai@icloud.com>
 * @copyright Copyright (C) 2026 Tayra Sakurai <tayra_sakurai@icloud.com>
 * @license Copyright (C) 2026 Tayra Sakurai
 * 
 * This is a part of StockpileMan Neo.
 * 
 * StockpileMan Neo is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * StockpileMan Neo is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with StockpileMan Neo. If not, see https://www.gnu.org/licenses/.
 */

import { Box, Typography } from "@mui/material";
import { useEffect, useRef } from "react";

/**
 * Animated Audio Visualizer component.
 * @param {object} props
 * @param {string} props.status Current session status ('idle' | 'connecting' | 'listening' | 'speaking' | 'executing_tool' | 'error')
 * @param {number} props.micVolume Current microphone volume (0.0 - 1.0)
 * @param {number} props.aiVolume Current AI output volume (0.0 - 1.0)
 * @param {string} [props.statusText]
 */
function AudioVisualizer({ status, micVolume = 0, aiVolume = 0, statusText = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let phase = 0;

    const numBars = 32;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const activeVolume = status === 'speaking' ? aiVolume : (status === 'listening' ? micVolume : 0);
      phase += 0.05 + activeVolume * 0.1;

      // Color scheme based on state
      let primaryColor = 'rgba(156, 39, 176, 0.8)'; // Purple for Gemini
      let glowColor = 'rgba(156, 39, 176, 0.4)';
      let secondaryColor = 'rgba(63, 81, 181, 0.8)';

      if (status === 'listening') {
        primaryColor = 'rgba(0, 188, 212, 0.85)'; // Cyan for user mic
        glowColor = 'rgba(0, 188, 212, 0.4)';
        secondaryColor = 'rgba(76, 175, 80, 0.8)';
      } else if (status === 'executing_tool') {
        primaryColor = 'rgba(255, 152, 0, 0.9)'; // Amber for tool execution
        glowColor = 'rgba(255, 152, 0, 0.4)';
        secondaryColor = 'rgba(255, 87, 34, 0.8)';
      } else if (status === 'connecting') {
        primaryColor = 'rgba(33, 150, 243, 0.8)'; // Blue for connecting
        glowColor = 'rgba(33, 150, 243, 0.3)';
        secondaryColor = 'rgba(103, 58, 183, 0.8)';
      } else if (status === 'idle' || status === 'disconnected') {
        primaryColor = 'rgba(158, 158, 158, 0.4)';
        glowColor = 'rgba(158, 158, 158, 0.1)';
        secondaryColor = 'rgba(189, 189, 189, 0.3)';
      }

      const barWidth = width / numBars - 3;
      const centerY = height / 2;

      for (let i = 0; i < numBars; i++) {
        const x = i * (barWidth + 3) + 2;

        let baseHeight = 6;
        if (status === 'connecting') {
          baseHeight = 10 + Math.sin(phase * 2 + i * 0.3) * 8;
        } else if (status === 'executing_tool') {
          baseHeight = 12 + Math.sin(phase * 3 + i * 0.4) * 10;
        } else if (status === 'speaking' || status === 'listening') {
          const wave = Math.sin(phase * 1.5 + i * 0.25) * Math.cos(phase * 0.8 + i * 0.15);
          baseHeight = 8 + (activeVolume * (height * 0.75) * (0.4 + 0.6 * Math.abs(wave)));
        }

        const barHeight = Math.min(height - 8, Math.max(4, baseHeight));
        const y = centerY - barHeight / 2;

        // Gradient for bars
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        grad.addColorStop(0, primaryColor);
        grad.addColorStop(1, secondaryColor);

        ctx.fillStyle = grad;
        ctx.shadowBlur = activeVolume > 0.1 ? 12 : 4;
        ctx.shadowColor = glowColor;

        // Rounded bar
        const radius = Math.min(barWidth / 2, barHeight / 2);
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [status, micVolume, aiVolume]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 2,
        width: '100%',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          height: 90,
          borderRadius: 4,
          background: 'rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <canvas
          ref={canvasRef}
          width={440}
          height={80}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
      {statusText ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, fontWeight: 500, letterSpacing: 0.3 }}
        >
          {statusText}
        </Typography>
      ) : null}
    </Box>
  );
}

export default AudioVisualizer;
