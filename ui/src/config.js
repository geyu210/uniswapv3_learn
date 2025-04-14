const config = {
  wethAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  factoryAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  managerAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  quoterAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  ABIs: {
    'ERC20': require('./abi/ERC20.json'),
    'Factory': require('./abi/Factory.json'),
    'Manager': require('./abi/Manager.json'),
    'Pool': require('./abi/Pool.json'),
    'Quoter': require('./abi/Quoter.json')
  }
};

// 只保留我们真正部署的代币：WETH和USDC
config.tokens = {};
config.tokens[config.wethAddress] = { symbol: 'WETH' };
config.tokens['0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'] = { symbol: 'USDC' };

export default config;