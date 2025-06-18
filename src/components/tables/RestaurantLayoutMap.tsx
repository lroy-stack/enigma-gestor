
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TableMapMode } from './ProfessionalTableMap';
import type { TableWithState } from '@/hooks/useTableStates';

interface RestaurantLayoutMapProps {
  mode: TableMapMode;
  selectedTables: Set<string>;
  onTableSelect: (tableId: string, multiSelect?: boolean) => void;
  onStateChange: (tableId: string, newState: string) => void;
  tables: TableWithState[];
}

interface LayoutTable {
  id: string;
  capacity: number;
  x: number;
  y: number;
  available: boolean;
  type?: string;
  label?: string;
  zone: 'campanar' | 'justicia' | 'interior';
}

export function RestaurantLayoutMap({
  mode,
  selectedTables,
  onTableSelect,
  onStateChange,
  tables
}: RestaurantLayoutMapProps) {
  // Layout definition based on your provided code
  const campanarTables: LayoutTable[] = [
    // Fila superior - mesas de 2 personas
    { id: 'T1', capacity: 2, x: 40, y: 80, available: true, zone: 'campanar' },
    { id: 'T2', capacity: 2, x: 110, y: 80, available: true, zone: 'campanar' },
    { id: 'T3', capacity: 2, x: 180, y: 80, available: true, zone: 'campanar' },
    { id: 'T4', capacity: 2, x: 250, y: 80, available: false, zone: 'campanar' },
    { id: 'T5', capacity: 2, x: 320, y: 80, available: true, zone: 'campanar' },
    { id: 'T6', capacity: 2, x: 390, y: 80, available: true, zone: 'campanar' },
    { id: 'T7', capacity: 2, x: 460, y: 80, available: true, zone: 'campanar' },
    { id: 'T8', capacity: 2, x: 530, y: 80, available: true, zone: 'campanar' },
    
    // Fila inferior - mezcla de 2 y 4 personas
    { id: 'T9', capacity: 4, x: 600, y: 80, available: true, zone: 'campanar' },
    { id: 'T10', capacity: 2, x: 690, y: 80, available: true, zone: 'campanar' },
    { id: 'T11', capacity: 2, x: 760, y: 80, available: true, zone: 'campanar' },
    { id: 'T12', capacity: 4, x: 830, y: 80, available: true, zone: 'campanar' },
    { id: 'T13', capacity: 4, x: 920, y: 80, available: false, zone: 'campanar' },
    { id: 'T14', capacity: 4, x: 1010, y: 80, available: true, zone: 'campanar' },
  ];

  const justiciaTables: LayoutTable[] = [
    // Mesas de 4 personas
    { id: 'T20', capacity: 4, x: 40, y: 80, available: true, zone: 'justicia' },
    { id: 'T21', capacity: 4, x: 150, y: 80, available: true, zone: 'justicia' },
    { id: 'T22', capacity: 4, x: 260, y: 80, available: true, zone: 'justicia' },
    { id: 'T23', capacity: 4, x: 370, y: 80, available: false, zone: 'justicia' },
    
    // Mesas de 2 personas
    { id: 'T24', capacity: 2, x: 500, y: 80, available: true, zone: 'justicia' },
    { id: 'T25', capacity: 2, x: 570, y: 80, available: true, zone: 'justicia' },
    { id: 'T26', capacity: 2, x: 640, y: 80, available: true, zone: 'justicia' },
    { id: 'T27', capacity: 2, x: 710, y: 80, available: true, zone: 'justicia' },
    { id: 'T28', capacity: 2, x: 780, y: 80, available: true, zone: 'justicia' },
  ];

  const interiorTables: LayoutTable[] = [
    { id: 'M1', capacity: 2, x: 60, y: 280, available: true, zone: 'interior' },
    { id: 'M2', capacity: 4, x: 60, y: 140, available: true, type: 'combinable', label: '2p + 2p', zone: 'interior' },
    { id: 'M3', capacity: 2, x: 60, y: 80, available: false, zone: 'interior' },
    { id: 'M4', capacity: 4, x: 200, y: 80, available: true, zone: 'interior' },
    { id: 'M5', capacity: 4, x: 340, y: 80, available: true, type: 'combinable', label: '2p + 2p', zone: 'interior' },
    { id: 'M6', capacity: 4, x: 420, y: 80, available: true, type: 'combinable', label: '2p + 2p', zone: 'interior' },
    { id: 'M7', capacity: 2, x: 200, y: 180, available: true, zone: 'interior' },
    { id: 'M8', capacity: 2, x: 340, y: 180, available: false, zone: 'interior' },
    { id: 'M10', capacity: 4, x: 300, y: 260, available: true, zone: 'interior' },
  ];

  const allTables = [...campanarTables, ...justiciaTables, ...interiorTables];

  const handleTableClick = (tableId: string) => {
    const table = allTables.find(t => t.id === tableId);
    if (!table?.available) return;
    
    if (mode === 'view') {
      // Solo cambio de estado en modo vista
      onStateChange(tableId, 'ocupada');
    } else if (mode === 'combine') {
      onTableSelect(tableId, true);
    } else {
      onTableSelect(tableId);
    }
  };

  const getTableStyle = (table: LayoutTable) => ({
    position: 'absolute' as const,
    left: `${table.x}px`,
    top: `${table.y}px`,
    width: table.capacity === 2 ? '60px' : '80px',
    height: table.capacity === 2 ? '60px' : '80px',
    borderRadius: '12px',
    border: selectedTables.has(table.id) 
      ? '3px solid #007AFF' 
      : table.available 
        ? '2px solid #E5E5EA' 
        : '2px solid #FF3B30',
    backgroundColor: selectedTables.has(table.id)
      ? '#007AFF15'
      : table.available 
        ? '#FFFFFF' 
        : '#FF3B3015',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: table.available ? 'pointer' : 'not-allowed',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    transform: selectedTables.has(table.id) ? 'scale(1.05)' : 'scale(1)',
  });

  // Estilos especiales para mesas grandes en sala interior
  const getInteriorTableStyle = (table: LayoutTable) => {
    let style = getTableStyle(table);
    
    // M2 - mesa vertical grande
    if (table.id === 'M2') {
      style.width = '60px';
      style.height = '120px';
    }
    
    // M10 - mesa horizontal grande
    if (table.id === 'M10') {
      style.width = '120px';
      style.height = '60px';
    }
    
    return style;
  };

  const totalCapacity = Array.from(selectedTables).reduce((sum, tableId) => {
    const table = allTables.find(t => t.id === tableId);
    return sum + (table ? table.capacity : 0);
  }, 0);

  const selectedCampanar = Array.from(selectedTables).filter(id => id.startsWith('T') && parseInt(id.slice(1)) <= 14);
  const selectedJusticia = Array.from(selectedTables).filter(id => id.startsWith('T') && parseInt(id.slice(1)) >= 20);
  const selectedInterior = Array.from(selectedTables).filter(id => id.startsWith('M'));

  return (
    <div style={{
      backgroundColor: '#F2F2F7',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{
          margin: '0 0 10px 0',
          fontSize: '28px',
          fontWeight: '700',
          color: '#000000',
        }}>
          Enigma Cocina con Alma
        </h1>
        <p style={{
          margin: '0',
          fontSize: '16px',
          color: '#8E8E93',
        }}>
          Sistema Profesional de Gestión de Sala
        </p>
      </div>

      {/* Stats Panel */}
      {selectedTables.size > 0 && (
        <div style={{
          backgroundColor: '#007AFF',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '20px',
          boxShadow: '0 2px 10px rgba(0,122,255,0.3)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: '#FFFFFF',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>
              Total: {selectedTables.size} mesas - {totalCapacity} personas
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.9, flexWrap: 'wrap' }}>
            {selectedInterior.length > 0 && (
              <div>Interior: {selectedInterior.join(', ')}</div>
            )}
            {selectedCampanar.length > 0 && (
              <div>Campanar: {selectedCampanar.join(', ')}</div>
            )}
            {selectedJusticia.length > 0 && (
              <div>Justicia: {selectedJusticia.join(', ')}</div>
            )}
          </div>
        </div>
      )}

      {/* Sala Interior */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        position: 'relative',
        minHeight: '400px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{
            margin: '0',
            fontSize: '22px',
            fontWeight: '600',
            color: '#000000',
          }}>
            🏠 Sala Interior
          </h2>
          <div style={{
            marginLeft: '16px',
            padding: '4px 12px',
            backgroundColor: '#8B5CF6',
            color: '#FFFFFF',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            9 mesas
          </div>
        </div>
        
        <div style={{ position: 'relative', minWidth: '600px', height: '360px' }}>
          {/* Mesas */}
          {interiorTables.map((table) => (
            <div
              key={table.id}
              style={getInteriorTableStyle(table)}
              onClick={() => handleTableClick(table.id)}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: selectedTables.has(table.id) 
                  ? '#007AFF' 
                  : table.available 
                    ? '#000000' 
                    : '#FF3B30',
              }}>
                {table.id}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#8E8E93',
                marginTop: '2px',
              }}>
                {table.type === 'combinable' ? table.label : `${table.capacity}p${table.capacity === 4 && table.type !== 'combinable' ? ' •' : ''}`}
              </div>
              {!table.available && (
                <div style={{
                  fontSize: '8px',
                  color: '#FF3B30',
                  fontWeight: '500',
                }}>
                  Ocupada
                </div>
              )}
            </div>
          ))}

          {/* Elementos fijos */}
          <div style={{
            position: 'absolute',
            left: '20px',
            bottom: '20px',
            width: '120px',
            height: '80px',
            backgroundColor: '#D97706',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: '600',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}>
            🍺 BARRA
          </div>

          <div style={{
            position: 'absolute',
            right: '20px',
            bottom: '20px',
            width: '80px',
            height: '100px',
            backgroundColor: '#6B7280',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: '600',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            gap: '4px',
          }}>
            <div>🚻</div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>WC Mujer</div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>WC Hombre</div>
          </div>

          <div style={{
            position: 'absolute',
            right: '120px',
            bottom: '20px',
            width: '60px',
            height: '60px',
            backgroundColor: '#10B981',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '10px',
            fontWeight: '600',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}>
            <div>🪜</div>
            <div>ABAJO</div>
          </div>

          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 12px',
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          }}>
            🚪 ENTRADA DESDE C/CAMPANAR
          </div>
        </div>
      </div>

      {/* Terraza Campanar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        position: 'relative',
        minHeight: '200px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{
            margin: '0',
            fontSize: '22px',
            fontWeight: '600',
            color: '#000000',
          }}>
            🏪 Terraza Campanar
          </h2>
          <div style={{
            marginLeft: '16px',
            padding: '4px 12px',
            backgroundColor: '#34C759',
            color: '#FFFFFF',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            14 mesas
          </div>
        </div>
        
        <div style={{ position: 'relative', minWidth: '1100px', height: '160px' }}>
          {campanarTables.map((table) => (
            <div
              key={table.id}
              style={getTableStyle(table)}
              onClick={() => handleTableClick(table.id)}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: selectedTables.has(table.id) 
                  ? '#007AFF' 
                  : table.available 
                    ? '#000000' 
                    : '#FF3B30',
              }}>
                {table.id}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#8E8E93',
                marginTop: '2px',
              }}>
                {table.capacity}p{table.capacity === 4 ? ' •' : ''}
              </div>
              {!table.available && (
                <div style={{
                  fontSize: '8px',
                  color: '#FF3B30',
                  fontWeight: '500',
                }}>
                  Ocupada
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Terraza Justicia */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '20px',
        position: 'relative',
        minHeight: '200px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'auto',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{
            margin: '0',
            fontSize: '22px',
            fontWeight: '600',
            color: '#000000',
          }}>
            ⚖️ Terraza Justicia
          </h2>
          <div style={{
            marginLeft: '16px',
            padding: '4px 12px',
            backgroundColor: '#FF9500',
            color: '#FFFFFF',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            9 mesas
          </div>
        </div>
        
        <div style={{ position: 'relative', minWidth: '860px', height: '160px' }}>
          {justiciaTables.map((table) => (
            <div
              key={table.id}
              style={getTableStyle(table)}
              onClick={() => handleTableClick(table.id)}
            >
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: selectedTables.has(table.id) 
                  ? '#007AFF' 
                  : table.available 
                    ? '#000000' 
                    : '#FF3B30',
              }}>
                {table.id}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#8E8E93',
                marginTop: '2px',
              }}>
                {table.capacity}p{table.capacity === 4 ? ' •' : ''}
              </div>
              {!table.available && (
                <div style={{
                  fontSize: '8px',
                  color: '#FF3B30',
                  fontWeight: '500',
                }}>
                  Ocupada
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: '600',
          color: '#000000',
        }}>
          Información Completa
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#8B5CF6' }}>
              Sala Interior
            </h4>
            <p style={{ margin: '0', fontSize: '14px', color: '#8E8E93' }}>
              M1, M3, M7-M8: Mesas de 2 personas<br/>
              M2, M5-M6: Mesas combinables (2p + 2p)<br/>
              M4, M10: Mesas de 4 personas •<br/>
              + Barra, WC H/M, Escalera
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#34C759' }}>
              Terraza Campanar
            </h4>
            <p style={{ margin: '0', fontSize: '14px', color: '#8E8E93' }}>
              T1-T8: Mesas de 2 personas<br/>
              T9, T12-T14: Mesas de 4 personas •<br/>
              T10-T11: Mesas de 2 personas
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#FF9500' }}>
              Terraza Justicia
            </h4>
            <p style={{ margin: '0', fontSize: '14px', color: '#8E8E93' }}>
              T20-T23: Mesas de 4 personas •<br/>
              T24-T28: Mesas de 2 personas
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#FFFFFF',
              border: '2px solid #E5E5EA',
              borderRadius: '4px',
            }}></div>
            <span style={{ fontSize: '14px', color: '#000000' }}>Disponible</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#007AFF15',
              border: '2px solid #007AFF',
              borderRadius: '4px',
            }}></div>
            <span style={{ fontSize: '14px', color: '#000000' }}>Seleccionada</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#FF3B3015',
              border: '2px solid #FF3B30',
              borderRadius: '4px',
            }}></div>
            <span style={{ fontSize: '14px', color: '#000000' }}>Ocupada</span>
          </div>
        </div>
        
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#F2F2F7', 
          borderRadius: '8px' 
        }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#8E8E93' }}>
            💡 <strong>Total:</strong> 32 mesas (9 interior + 14 Campanar + 9 Justicia). 
            Las mesas se pueden combinar para grupos más grandes. 
            Punto (•) = 4 personas fijas | 2p + 2p = Mesas combinables | Sin punto = 2 personas
          </p>
        </div>
      </div>
    </div>
  );
}
