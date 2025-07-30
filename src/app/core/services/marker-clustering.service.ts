import { Injectable } from '@angular/core';
import { Cafe } from '../models/cafe.model';
import { CoordinateTransformService, SvgPoint } from './coordinate-transform.service';

export interface CafeCluster {
  id: string;
  cafes: Cafe[];
  center: SvgPoint;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MarkerClusteringService {
  constructor(private coordinateTransform: CoordinateTransformService) {}

  /**
   * カフェをクラスタリング
   * @param cafes カフェのリスト
   * @param zoomLevel 現在のズームレベル
   * @param clusterRadius クラスタリング半径（SVG座標系）
   */
  clusterCafes(cafes: Cafe[], zoomLevel: number, clusterRadius: number = 50): CafeCluster[] {
    // ズームレベルに応じてクラスタリング半径を調整
    const adjustedRadius = clusterRadius / Math.pow(zoomLevel, 0.5);
    
    const clusters: CafeCluster[] = [];
    const processedCafes = new Set<string>();

    cafes.forEach(cafe => {
      if (processedCafes.has(cafe.id.toString()) || !cafe.lat || !cafe.lng) {
        return;
      }

      // 新しいクラスタを作成
      const cafePosition = this.coordinateTransform.latLngToSvg({
        lat: cafe.lat,
        lng: cafe.lng
      });

      const cluster: CafeCluster = {
        id: `cluster-${clusters.length}`,
        cafes: [cafe],
        center: cafePosition,
        bounds: {
          minX: cafePosition.x,
          maxX: cafePosition.x,
          minY: cafePosition.y,
          maxY: cafePosition.y
        }
      };

      processedCafes.add(cafe.id.toString());

      // 近くのカフェをクラスタに追加
      cafes.forEach(otherCafe => {
        if (processedCafes.has(otherCafe.id.toString()) || 
            !otherCafe.lat || !otherCafe.lng ||
            cafe.id === otherCafe.id) {
          return;
        }

        const otherPosition = this.coordinateTransform.latLngToSvg({
          lat: otherCafe.lat,
          lng: otherCafe.lng
        });

        const distance = this.calculateDistance(cafePosition, otherPosition);

        if (distance <= adjustedRadius) {
          cluster.cafes.push(otherCafe);
          processedCafes.add(otherCafe.id.toString());

          // クラスタの境界を更新
          cluster.bounds.minX = Math.min(cluster.bounds.minX, otherPosition.x);
          cluster.bounds.maxX = Math.max(cluster.bounds.maxX, otherPosition.x);
          cluster.bounds.minY = Math.min(cluster.bounds.minY, otherPosition.y);
          cluster.bounds.maxY = Math.max(cluster.bounds.maxY, otherPosition.y);
        }
      });

      // クラスタの中心を再計算
      if (cluster.cafes.length > 1) {
        cluster.center = this.calculateClusterCenter(cluster);
      }

      clusters.push(cluster);
    });

    return clusters;
  }

  /**
   * 2点間の距離を計算
   */
  private calculateDistance(point1: SvgPoint, point2: SvgPoint): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * クラスタの中心点を計算
   */
  private calculateClusterCenter(cluster: CafeCluster): SvgPoint {
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    cluster.cafes.forEach(cafe => {
      if (cafe.lat && cafe.lng) {
        const position = this.coordinateTransform.latLngToSvg({
          lat: cafe.lat,
          lng: cafe.lng
        });
        sumX += position.x;
        sumY += position.y;
        count++;
      }
    });

    return {
      x: sumX / count,
      y: sumY / count
    };
  }

  /**
   * ズームレベルに応じてクラスタリングを使用するかどうかを判定
   */
  shouldUseClustering(zoomLevel: number): boolean {
    return zoomLevel < 2.5;
  }
}