import React, { useState, useEffect } from 'react';
import { useDailyMetrics, useHourlyMetrics, useChannelMetrics, useZoneStats, useTopCustomers, usePopularTables } from '@/hooks/useAnalytics';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Calendar, CheckCircle, UserX, Crown, Clock, Users, X, Activity, Star, Target, Lightbulb, BarChart3, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

const RestaurantAnalytics = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'total_reservas' | 'total_comensales' | 'reservas_completadas'>('total_reservas');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const days = selectedPeriod === 'week' ? 7 : 30;
  const { data: dailyMetrics, isLoading: loadingDaily } = useDailyMetrics(days);
  const { data: hourlyMetrics, isLoading: loadingHourly } = useHourlyMetrics();
  const { data: channelMetrics, isLoading: loadingChannel } = useChannelMetrics(days);
  const { data: zoneStats, isLoading: loadingZones } = useZoneStats();
  const { data: topCustomers } = useTopCustomers(days);
  const { data: popularTables } = usePopularTables(days);

  if (loadingDaily || loadingHourly || loadingChannel || loadingZones) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        backgroundColor: '#F2F2F7'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Calculate metrics from real data
  const totalReservations = dailyMetrics?.reduce((sum, day) => sum + day.total_reservas, 0) || 0;
  const totalGuests = dailyMetrics?.reduce((sum, day) => sum + day.total_comensales, 0) || 0;
  const totalCompleted = dailyMetrics?.reduce((sum, day) => sum + day.reservas_completadas, 0) || 0;
  const totalNoShows = dailyMetrics?.reduce((sum, day) => sum + day.reservas_no_show, 0) || 0;
  const totalCancellations = dailyMetrics?.reduce((sum, day) => sum + day.reservas_canceladas, 0) || 0;
  const totalVip = dailyMetrics?.reduce((sum, day) => sum + day.reservas_vip, 0) || 0;

  const avgGuestsPerReservation = totalReservations > 0 ? (totalGuests / totalReservations).toFixed(1) : '0';
  const completionRate = totalReservations > 0 ? ((totalCompleted / totalReservations) * 100).toFixed(1) : '0';
  const noShowRate = totalReservations > 0 ? ((totalNoShows / totalReservations) * 100).toFixed(1) : '0';
  const cancellationRate = totalReservations > 0 ? ((totalCancellations / totalReservations) * 100).toFixed(1) : '0';
  const vipRate = totalReservations > 0 ? ((totalVip / totalReservations) * 100).toFixed(1) : '0';

  const avgDuration = dailyMetrics?.length ? 
    (dailyMetrics.reduce((sum, day) => sum + day.duracion_promedio_minutos, 0) / dailyMetrics.length).toFixed(0) : '120';

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      doc.setFillColor(35, 117, 132); // Enigma teal color
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('Enigma Cocina con Alma', 20, 18);
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text('Reporte de Analíticas del Restaurante', 20, 25);
      
      yPosition = 45;
      doc.setTextColor(0, 0, 0);

      // Report period and date
      doc.setFontSize(10);
      doc.text(`Período: ${selectedPeriod === 'week' ? 'Última semana' : 'Último mes'}`, 20, yPosition);
      doc.text(`Fecha generación: ${new Date().toLocaleString('es-ES')}`, 130, yPosition);
      yPosition += 15;

      // Main metrics section
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('MÉTRICAS PRINCIPALES', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      
      const metrics = [
        { label: 'Total Reservas', value: totalReservations.toString(), subtitle: `${avgGuestsPerReservation} personas promedio` },
        { label: 'Tasa de Completado', value: `${completionRate}%`, subtitle: `${totalCompleted} de ${totalReservations} reservas` },
        { label: 'No-Show Rate', value: `${noShowRate}%`, subtitle: `${totalNoShows} no se presentaron` },
        { label: 'Clientes VIP', value: `${vipRate}%`, subtitle: `${totalVip} reservas VIP` },
        { label: 'Promedio Duración', value: `${avgDuration}min`, subtitle: 'Tiempo promedio por mesa' },
        { label: 'Total Comensales', value: totalGuests.toString(), subtitle: 'Personas atendidas' },
        { label: 'Tasa Cancelación', value: `${cancellationRate}%`, subtitle: `${totalCancellations} canceladas` }
      ];

      let col = 0;
      metrics.forEach((metric, index) => {
        const x = 20 + (col * 90);
        doc.setFont(undefined, 'bold');
        doc.text(metric.label, x, yPosition);
        doc.setFontSize(16);
        doc.text(metric.value, x, yPosition + 8);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(metric.subtitle, x, yPosition + 15);
        
        col++;
        if (col >= 2) {
          col = 0;
          yPosition += 25;
        }
      });

      if (col > 0) yPosition += 25;
      yPosition += 10;

      // Channel distribution
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('CANALES DE RESERVA', 20, yPosition);
      yPosition += 10;

      if (channelMetrics && channelMetrics.length > 0) {
        const totalChannelReservations = channelMetrics.reduce((sum, c) => sum + Number(c.total_reservas), 0);
        
        channelMetrics.forEach((channel) => {
          const percentage = totalChannelReservations > 0 ? 
            Math.round((Number(channel.total_reservas) / totalChannelReservations) * 100) : 0;
          
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`${channel.canal}: ${channel.total_reservas} reservas (${percentage}%)`, 20, yPosition);
          yPosition += 6;
        });
      }

      yPosition += 10;

      // Zone performance
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('RENDIMIENTO POR ZONA', 20, yPosition);
      yPosition += 10;

      if (zoneStats && zoneStats.length > 0) {
        zoneStats.forEach((zone) => {
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.text(`${zone.zona}: ${zone.porcentaje_ocupacion || 0}% ocupación`, 20, yPosition);
          doc.text(`${zone.total_mesas} mesas | ${zone.total_reservas_hoy} reservas hoy`, 20, yPosition + 5);
          yPosition += 12;
        });
      }

      yPosition += 10;

      // Insights section
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('INSIGHTS DEL PERÍODO', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');

      // Top customer
      if (topCustomers && topCustomers.length > 0) {
        const topCustomer = topCustomers[0] as any;
        doc.text(`Cliente más frecuente: ${topCustomer.nombre} ${topCustomer.apellido} (${topCustomer.visitas} visitas)`, 20, yPosition);
        yPosition += 8;
      }

      // Most popular table
      if (popularTables && popularTables.length > 0) {
        const popularTable = popularTables[0] as any;
        doc.text(`Mesa más solicitada: Mesa ${popularTable.numero_mesa} (${popularTable.reservas} reservas)`, 20, yPosition);
        yPosition += 8;
      }

      // Best time slot
      if (hourlyMetrics && hourlyMetrics.length > 0) {
        const bestHour = hourlyMetrics.reduce((max, current) => 
          (current.total_reservas || 0) > (max.total_reservas || 0) ? current : max
        );
        doc.text(`Mejor horario: ${bestHour.hora_inicio} (${bestHour.total_reservas} reservas)`, 20, yPosition);
        yPosition += 8;
      }

      // Most active zone
      if (zoneStats && zoneStats.length > 0) {
        const activeZone = zoneStats.reduce((max, zone) => (zone.total_reservas_hoy || 0) > (max.total_reservas_hoy || 0) ? zone : max);
        doc.text(`Zona más activa: ${activeZone.zona}`, 20, yPosition);
        yPosition += 15;
      }

      // Footer
      doc.setFillColor(240, 240, 240);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      doc.text('Generado por Sistema de Gestión Enigma - Confidencial', 20, pageHeight - 10);
      doc.text(`Página 1 de 1`, pageWidth - 40, pageHeight - 10);

      // Save the PDF
      const fileName = `enigma-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Reporte exportado",
        description: `El reporte se ha descargado como ${fileName}`,
      });

    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el reporte PDF. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Components
  const LineChart = ({ data, metric, height = 200 }: { data: any[], metric: string, height?: number }) => {
    if (!data || data.length === 0) return <div>No hay datos disponibles</div>;
    
    const values = data.map(d => Number(d[metric]) || 0);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    return (
      <div style={{ position: 'relative', height: `${height}px`, padding: '20px 0' }}>
        <svg width="100%" height={height}>
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1="0"
              y1={height * percent / 100}
              x2="100%"
              y2={height * percent / 100}
              stroke="#F0F0F0"
              strokeWidth="1"
            />
          ))}
          
          <polyline
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - ((Number(d[metric]) - minValue) / range * 100);
              return `${x}%,${y}%`;
            }).join(' ')}
            fill="none"
            stroke="#237584"
            strokeWidth="3"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />
          
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((Number(d[metric]) - minValue) / range * 100);
            return (
              <circle
                key={i}
                cx={`${x}%`}
                cy={`${y}%`}
                r="4"
                fill="#237584"
              />
            );
          })}
        </svg>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
          fontSize: '12px',
          color: '#6B7280'
        }}>
          {data.map((d, i) => (
            <span key={i} style={{ 
              flex: 1, 
              textAlign: i === 0 ? 'left' : i === data.length - 1 ? 'right' : 'center' 
            }}>
              {new Date(d.fecha).toLocaleDateString('es-ES', { weekday: 'short' })}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const BarChart = ({ data, maxHeight = 150 }: { data: any[], maxHeight?: number }) => {
    if (!data || data.length === 0) return <div>No hay datos disponibles</div>;
    
    const maxValue = Math.max(...data.map(d => Number(d.total_reservas) || 0));
    
    return (
      <div style={{ display: 'flex', alignItems: 'end', height: `${maxHeight}px`, gap: '8px', padding: '10px 0' }}>
        {data.map((item, index) => (
          <div key={index} style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            height: '100%'
          }}>
            <div style={{
              backgroundColor: '#237584',
              width: '100%',
              height: `${maxValue > 0 ? (Number(item.total_reservas) / maxValue) * 100 : 0}%`,
              borderRadius: '4px 4px 0 0',
              minHeight: '4px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: '600',
              paddingBottom: '4px'
            }}>
              {Number(item.total_reservas) > 0 && Number(item.total_reservas)}
            </div>
            <div style={{
              fontSize: '10px',
              color: '#6B7280',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {item.hora_inicio}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const DonutChart = ({ data, size = 120 }: { data: any[], size?: number }) => {
    if (!data || data.length === 0) return <div>No hay datos disponibles</div>;
    
    const total = data.reduce((sum, item) => sum + Number(item.total_reservas), 0);
    if (total === 0) return <div>No hay datos disponibles</div>;
    
    let currentAngle = 0;
    const radius = size / 2 - 10;
    const center = size / 2;

    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          {data.map((item, index) => {
            const angle = (Number(item.total_reservas) / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = center + radius * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = center + radius * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = center + radius * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = center + radius * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${center} ${center}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            const colors = ['#237584', '#9FB289', '#CB5910', '#FF9500'];
            
            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            );
          })}
          
          <circle
            cx={center}
            cy={center}
            r={radius * 0.6}
            fill="#FFFFFF"
          />
          
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            fontSize="16"
            fontWeight="700"
            fill="#000000"
          >
            {total}
          </text>
          <text
            x={center}
            y={center + 10}
            textAnchor="middle"
            fontSize="10"
            fill="#6B7280"
          >
            Total
          </text>
        </svg>
      </div>
    );
  };

  const MetricCard = ({ title, value, subtitle, change, color, IconComponent }: {
    title: string;
    value: string | number;
    subtitle: string;
    change?: number;
    color: string;
    IconComponent: React.ComponentType<any>;
  }) => (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #F0F0F0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '-10px',
        right: '-10px',
        width: '50px',
        height: '50px',
        backgroundColor: `${color}20`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <IconComponent size={20} color={color} />
      </div>
      <h3 style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#8E8E93',
        margin: '0 0 8px 0',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}>
        {title}
      </h3>
      <div style={{
        fontSize: '28px',
        fontWeight: '700',
        color: '#000000',
        marginBottom: '4px',
      }}>
        {value}
      </div>
      <p style={{
        fontSize: '12px',
        color: '#6B7280',
        margin: '0 0 8px 0',
      }}>
        {subtitle}
      </p>
      {change !== undefined && (
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: change > 0 ? '#34C759' : change < 0 ? '#FF3B30' : '#6B7280',
        }}>
          {change > 0 ? '↗' : change < 0 ? '↘' : '→'} {Math.abs(change)}% vs período anterior
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#F2F2F7',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Static Header - Not fixed, just a regular header */}
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        border: '1px solid #E5E5EA',
        padding: '20px 24px',
        marginBottom: '24px',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#000000',
              margin: '0',
            }}>
              Analíticas del Restaurante
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#8E8E93',
              margin: '4px 0 0 0',
            }}>
              Insights y métricas operacionales • {currentTime.toLocaleTimeString('es-ES')}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month')}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                border: '2px solid #E5E5EA',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
            
            <button 
              onClick={exportToPDF}
              disabled={isExporting}
              style={{
                backgroundColor: isExporting ? '#6B7280' : '#237584',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isExporting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isExporting ? 0.7 : 1,
              }}
            >
              <Download size={16} />
              {isExporting ? 'Exportando...' : 'Exportar Reporte'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        
        {/* KPI Cards */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#000000',
            margin: '0 0 20px 0',
          }}>
            Métricas Principales
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <MetricCard
              title="Total Reservas"
              value={totalReservations}
              subtitle={`${avgGuestsPerReservation} personas promedio`}
              change={12}
              color="#237584"
              IconComponent={Calendar}
            />
            <MetricCard
              title="Tasa de Completado"
              value={`${completionRate}%`}
              subtitle={`${totalCompleted} de ${totalReservations} reservas`}
              change={5}
              color="#34C759"
              IconComponent={CheckCircle}
            />
            <MetricCard
              title="No-Show Rate"
              value={`${noShowRate}%`}
              subtitle={`${totalNoShows} no se presentaron`}
              change={-2}
              color="#FF3B30"
              IconComponent={UserX}
            />
            <MetricCard
              title="Clientes VIP"
              value={`${vipRate}%`}
              subtitle={`${totalVip} reservas VIP`}
              change={8}
              color="#CB5910"
              IconComponent={Crown}
            />
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            <MetricCard
              title="Promedio Duración"
              value={`${avgDuration}min`}
              subtitle="Tiempo promedio por mesa"
              change={-3}
              color="#9FB289"
              IconComponent={Clock}
            />
            <MetricCard
              title="Total Comensales"
              value={totalGuests}
              subtitle="Personas atendidas"
              change={15}
              color="#007AFF"
              IconComponent={Users}
            />
            <MetricCard
              title="Tasa Cancelación"
              value={`${cancellationRate}%`}
              subtitle={`${totalCancellations} canceladas`}
              change={-1}
              color="#FF9500"
              IconComponent={X}
            />
            <MetricCard
              title="Ocupación Mesas"
              value={zoneStats ? `${Math.round(zoneStats.reduce((sum, zone) => sum + (zone.porcentaje_ocupacion || 0), 0) / zoneStats.length)}%` : '0%'}
              subtitle="Promedio de ocupación"
              change={4}
              color="#6B46C1"
              IconComponent={Activity}
            />
          </div>
        </section>

        {/* Charts Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '24px',
          marginBottom: '32px',
        }}>
          
          {/* Trend Chart */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #F0F0F0',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#000000',
                margin: '0',
              }}>
                Tendencia de Reservas
              </h3>
              
              <div style={{ display: 'flex', backgroundColor: '#F2F2F7', borderRadius: '8px', padding: '2px' }}>
                {[
                  { key: 'total_reservas', label: 'Reservas' },
                  { key: 'total_comensales', label: 'Comensales' },
                  { key: 'reservas_completadas', label: 'Completadas' },
                ].map((metric) => (
                  <button
                    key={metric.key}
                    onClick={() => setSelectedMetric(metric.key as typeof selectedMetric)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: selectedMetric === metric.key ? '#237584' : 'transparent',
                      color: selectedMetric === metric.key ? '#FFFFFF' : '#000000',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
            </div>
            
            <LineChart data={dailyMetrics || []} metric={selectedMetric} height={250} />
          </div>

          {/* Channel Distribution */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #F0F0F0',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#000000',
              margin: '0 0 20px 0',
            }}>
              Canales de Reserva
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <DonutChart data={channelMetrics || []} size={140} />
              
              <div style={{ flex: 1 }}>
                {channelMetrics?.map((channel, index) => {
                  const colors = ['#237584', '#9FB289', '#CB5910', '#FF9500'];
                  const total = channelMetrics.reduce((sum, c) => sum + Number(c.total_reservas), 0);
                  const percentage = total > 0 ? Math.round((Number(channel.total_reservas) / total) * 100) : 0;
                  
                  return (
                    <div key={channel.canal} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: index < channelMetrics.length - 1 ? '1px solid #F0F0F0' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: colors[index],
                        }} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#000000' }}>
                          {channel.canal}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#000000' }}>
                          {channel.total_reservas}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                          {percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px',
        }}>
          
          {/* Hourly Distribution */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #F0F0F0',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#000000',
              margin: '0 0 20px 0',
            }}>
              Distribución Horaria
            </h3>
            <BarChart data={hourlyMetrics || []} maxHeight={200} />
            <p style={{
              fontSize: '12px',
              color: '#6B7280',
              textAlign: 'center',
              margin: '10px 0 0 0',
            }}>
              Reservas por franja horaria (hoy)
            </p>
          </div>

          {/* Zone Performance */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #F0F0F0',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#000000',
              margin: '0 0 20px 0',
            }}>
              Rendimiento por Zona
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {zoneStats?.map((zone, index) => (
                <div key={zone.zona} style={{
                  padding: '16px',
                  backgroundColor: '#F8F9FA',
                  borderRadius: '12px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#000000',
                      margin: '0',
                    }}>
                      {zone.zona}
                    </h4>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#237584',
                    }}>
                      {zone.porcentaje_ocupacion || 0}%
                    </span>
                  </div>
                  
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#E5E5EA',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      width: `${zone.porcentaje_ocupacion || 0}%`,
                      height: '100%',
                      backgroundColor: '#237584',
                      borderRadius: '4px',
                    }} />
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#6B7280',
                  }}>
                    <span>{zone.total_mesas} mesas</span>
                    <span>{zone.total_reservas_hoy} reservas</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <section style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #F0F0F0',
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#000000',
            margin: '0 0 20px 0',
          }}>
            Insights del Período
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '8px' 
              }}>
                <Star size={24} color="#FFD700" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000000', margin: '0 0 4px 0' }}>
                Cliente Frecuente
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0' }}>
                {topCustomers && topCustomers.length > 0 
                  ? `${(topCustomers[0] as any).nombre} ${(topCustomers[0] as any).apellido} (${(topCustomers[0] as any).visitas} visitas)`
                  : 'No hay datos disponibles'
                }
              </p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '8px' 
              }}>
                <Target size={24} color="#FF6B35" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000000', margin: '0 0 4px 0' }}>
                Mesa Más Solicitada
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0' }}>
                {popularTables && popularTables.length > 0
                  ? `Mesa ${(popularTables[0] as any).numero_mesa} (${(popularTables[0] as any).reservas} reservas)`
                  : 'No hay datos disponibles'
                }
              </p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '8px' 
              }}>
                <Lightbulb size={24} color="#34C759" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000000', margin: '0 0 4px 0' }}>
                Mejor Horario
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0' }}>
                {hourlyMetrics && hourlyMetrics.length > 0
                  ? (() => {
                      const bestHour = hourlyMetrics.reduce((max, current) => 
                        (current.total_reservas || 0) > (max.total_reservas || 0) ? current : max
                      );
                      return `${bestHour.hora_inicio} (${bestHour.total_reservas} reservas)`;
                    })()
                  : 'No hay datos disponibles'
                }
              </p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '8px' 
              }}>
                <BarChart3 size={24} color="#6366F1" />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#000000', margin: '0 0 4px 0' }}>
                Zona Más Activa
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0' }}>
                {zoneStats && zoneStats.length > 0
                  ? `${zoneStats.reduce((max, zone) => (zone.total_reservas_hoy || 0) > (max.total_reservas_hoy || 0) ? zone : max).zona}`
                  : 'No hay datos disponibles'
                }
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RestaurantAnalytics;
