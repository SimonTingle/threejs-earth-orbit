class DataFetcher {
    constructor() {
        this.cache = new Map();
        this.lastUpdate = null;
    }

    async fetchSatelliteData(groups = ['stations', 'gps-ops', 'weather', 'active']) {
        const allSatellites = [];
        
        try {
            for (const group of groups) {
                const data = await this.fetchGroupData(group);
                allSatellites.push(...data.map(sat => ({
                    ...sat,
                    category: this.categorizeSatellite(sat.OBJECT_NAME, group)
                })));
            }
            
            this.lastUpdate = new Date();
            return allSatellites;
            
        } catch (error) {
            console.error('Error fetching satellite data:', error);
            return this.getCachedData();
        }
    }

    async fetchGroupData(group) {
        const cacheKey = `${group}_${Math.floor(Date.now() / 3600000)}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`);
            const data = await response.json();
            
            this.cache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error(`Error fetching ${group} data:`, error);
            return [];
        }
    }

    categorizeSatellite(name, group) {
        const nameLower = name.toLowerCase();
        
        if (group === 'stations' || nameLower.includes('iss') || nameLower.includes('zarya')) {
            return 'stations';
        } else if (group === 'gps-ops') {
            return 'gps';
        } else if (group === 'weather') {
            return 'weather';
        } else if (nameLower.includes('starlink') || nameLower.includes('oneweb')) {
            return 'communications';
        }
        return 'other';
    }

    getColorByCategory(category) {
        const colors = {
            'stations': 0xff6b6b,
            'gps': 0x4ecdc4,
            'weather': 0x45b7d1,
            'communications': 0x96ceb4,
            'other': 0xdda0dd
        };
        return colors[category] || colors.other;
    }

    getCachedData() {
        const cached = Array.from(this.cache.values()).flat();
        return cached.length > 0 ? cached : [];
    }
}
