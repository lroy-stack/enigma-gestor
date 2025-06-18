import React, { useState } from 'react';

const RestaurantLayout = () => {
  const [selectedTables, setSelectedTables] = useState([]);

  // Terraza Campanar (arriba)
  const campanarTables = [
    // Fila superior - mesas de 2 personas
    { id: 'T1', capacity: 2, x: 40, y: 80, available: true },
    { id: 'T2', capacity: 2, x: 110, y: 80, available: true },
    { id: 'T3', capacity: 2, x: 180, y: 80, available: true },
    { id: 'T4', capacity: 2, x: 250, y: 80, available: false },
    { id: 'T5', capacity: 2, x: 320, y: 80, available: true },
    { id: 'T6', capacity: 2, x: 390, y: 80, available: true },
    { id: 'T7', capacity: 2, x: 460, y: 80, available: true },
    { id: 'T8', capacity: 2, x: 530, y: 80, available: true },
    
    // Fila inferior - mezcla de 2 y 4 personas
    { id: 'T9', capacity: 4, x: 600, y: 80, available: true }, // con punto
    { id: 'T10', capacity: 2, x: 690, y: 80, available: true },
    { id: 'T11', capacity: 2, x: 760, y: 80, available: true },
    { id: 'T12', capacity: 4, x: 830, y: 80, available: true }, // con punto
    { id: 'T13', capacity: 4, x: 920, y: 80, available: false }, // con punto
    { id: 'T14', capacity: 4, x: 1010, y: 80, available: true }, // con punto
  ];

  // Terraza Justicia (abajo)
  const justiciaTables = [
    // Mesas de 4 personas (con puntos)
    { id: 'T20', capacity: 4, x: 40, y: 80, available: true },
    { id: 'T21', capacity: 4, x: 150, y: 80, available: true },
    { id: 'T22', capacity: 4, x: 260, y: 80, available: true },
    { id: 'T23', capacity: 4, x: 370, y: 80, available: false },
    
    // Mesas de 2 personas (sin puntos)
    { id: 'T24', capacity: 2, x: 500, y: 80, available: true },
    { id: 'T25', capacity: 2, x: 570, y: 80, available: true },
    { id: 'T26', capacity: 2, x: 640, y: 80, available: true },
    { id: 'T27', capacity: 2, x: 710, y: 80, available: true },
    { id: 'T28', capacity: 2, x: 780, y: 80, available: true },
  ];

  const allTables = [...campanarTables, ...justiciaTables];

  const handleTableClick = (tableId) => {
    const table = allTables.find(t => t.id === tableId);
    if (!table.available) return;
    
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const getTableStyle = (table) => ({
    position: 'absolute',
    left: `${table.x}px`,
    top: `${table.y}px`,
    width: table.capacity === 2 ? '60px' : '80px',
    height: table.capacity === 2 ? '60px' : '80px',
    borderRadius: '12px',
    border: selectedTables.includes(table.id) 
      ? '3px solid #007AFF' 
      : table.available 
        ? '2px solid #E5E5EA' 
        : '2px solid #FF3B30',
    backgroundColor: selectedTables.includes(table.id)
      ? '#007AFF15'
      : table.available 
        ? '#FFFFFF' 
        : '#FF3B3015',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: table.available ? 'pointer' : 'not-allowed',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    transform: selectedTables.includes(table.id) ? 'scale(1.05)' : 'scale(1)',
  });

  const totalCapacity = selectedTables.reduce((sum, tableId) => {
    const table = allTables.find(t => t.id === tableId);
    return sum + (table ? table.capacity : 0);
  }, 0);

  const selectedCampanar = selectedTables.filter(id => id.startsWith('T') && parseInt(id.slice(1)) <= 14);
  const selectedJusticia = selectedTables.filter(id => id.startsWith('T') && parseInt(id.slice(1)) >= 20);

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
          Terrazas del Restaurante
        </h1>
        <p style={{
          margin: '0',
          fontSize: '16px',
          color: '#8E8E93',
        }}>
          Dos terrazas disponibles para reservas
        </p>
      </div>

      {/* Stats Panel */}
      {selectedTables.length > 0 && (
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
              Total: {selectedTables.length} mesas - {totalCapacity} personas
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.9 }}>
            {selectedCampanar.length > 0 && (
              <div>Campanar: {selectedCampanar.join(', ')}</div>
            )}
            {selectedJusticia.length > 0 && (
              <div>Justicia: {selectedJusticia.join(', ')}</div>
            )}
          </div>
        </div>
      )}

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
            🏪 Calle Campanar
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
                color: selectedTables.includes(table.id) 
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
            ⚖️ Calle Justicia
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
                color: selectedTables.includes(table.id) 
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
          Información
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#007AFF' }}>
              Calle Campanar
            </h4>
            <p style={{ margin: '0', fontSize: '14px', color: '#8E8E93' }}>
              T1-T8: Mesas de 2 personas<br/>
              T9, T12-T14: Mesas de 4 personas •<br/>
              T10-T11: Mesas de 2 personas
            </p>
          </div>
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#FF9500' }}>
              Calle Justicia
            </h4>
            <p style={{ margin: '0', fontSize: '14px', color: '#8E8E93' }}>
              T20-T23: Mesas de 4 personas •<br/>
              T24-T28: Mesas de 2 personas
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
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
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#F2F2F7', 
          borderRadius: '8px' 
        }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#8E8E93' }}>
            💡 <strong>Combinaciones:</strong> Las mesas se pueden unir para grupos más grandes. 
            Punto (•) = 4 personas | Sin punto = 2 personas
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLayout;