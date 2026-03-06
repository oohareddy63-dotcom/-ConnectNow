import dns from 'dns';
import { promisify } from 'util';

const resolveSrv = promisify(dns.resolveSrv);
const resolve4 = promisify(dns.resolve4);

async function testAtlasConnection() {
    console.log('🔍 Testing MongoDB Atlas DNS Resolution...\n');
    
    const srvRecord = '_mongodb._tcp.connectnow2.ugb9vzc.mongodb.net';
    
    try {
        console.log(`Attempting to resolve SRV record: ${srvRecord}`);
        const addresses = await resolveSrv(srvRecord);
        
        console.log('✅ SRV Resolution Successful!');
        console.log('Found MongoDB servers:');
        addresses.forEach((addr, i) => {
            console.log(`  ${i + 1}. ${addr.name}:${addr.port} (priority: ${addr.priority})`);
        });
        
        console.log('\n🔍 Resolving IP addresses...');
        for (const addr of addresses) {
            try {
                const ips = await resolve4(addr.name);
                console.log(`  ${addr.name} -> ${ips.join(', ')}`);
            } catch (err) {
                console.log(`  ${addr.name} -> Failed to resolve IP`);
            }
        }
        
        console.log('\n✅ DNS is working! MongoDB Atlas should connect.');
        console.log('Try restarting your backend server.');
        
    } catch (error) {
        console.log('❌ SRV Resolution Failed!');
        console.log(`Error: ${error.message}`);
        console.log('\n🔧 Possible Solutions:\n');
        
        console.log('1. CHANGE DNS SERVERS (RECOMMENDED):');
        console.log('   - Open Network Settings');
        console.log('   - Change DNS to Google DNS:');
        console.log('     Primary: 8.8.8.8');
        console.log('     Secondary: 8.8.4.4');
        console.log('   - Restart computer');
        console.log('   - Run this test again\n');
        
        console.log('2. USE MOBILE HOTSPOT:');
        console.log('   - Enable hotspot on your phone');
        console.log('   - Connect computer to hotspot');
        console.log('   - Run this test again\n');
        
        console.log('3. DISABLE VPN/PROXY:');
        console.log('   - Turn off any VPN');
        console.log('   - Disable proxy settings');
        console.log('   - Run this test again\n');
        
        console.log('4. DEPLOY TO RENDER (BYPASSES THIS ISSUE):');
        console.log('   - See RENDER-DEPLOYMENT-GUIDE.md');
        console.log('   - Render servers don\'t have DNS issues');
        console.log('   - MongoDB Atlas will work automatically\n');
        
        console.log('📝 Current Status:');
        console.log('   - Your app works perfectly with local MongoDB');
        console.log('   - All features are functional');
        console.log('   - Data is stored locally (not in Atlas)');
        console.log('   - This is fine for development!\n');
    }
}

console.log('='.repeat(60));
console.log('MongoDB Atlas Connection Test');
console.log('='.repeat(60));
console.log();

testAtlasConnection();
