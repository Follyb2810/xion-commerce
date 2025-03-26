import axios from "axios";

class Currency {
    
    static async getCryptoPrice(coin: string): Promise<number | null> {
        try {
            const response = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`
            );
            return response.data[coin]?.usd ?? null;
        } catch (error) {
            console.error(`Error fetching price for ${coin}:`, error);
            return null;
        }
    }

    static async convert(from: string, to: string, amount: number): Promise<number | null> {
        const fromPrice = await this.getCryptoPrice(from);
        const toPrice = await this.getCryptoPrice(to);

        if (!fromPrice || !toPrice) {
            console.error("Invalid cryptocurrency symbol or price not found.");
            return null;
        }

        return (amount * fromPrice) / toPrice;
    }
}

// Example Usage:
(async () => {
    const amount = 0.1; // BTC amount
    const result = await Currency.convert("bitcoin", "binancecoin", amount);

    console.log(`Converted Amount: ${result} BNB`);
})();
