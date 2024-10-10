import { Abi } from 'abitype'

declare function readContract(config: {
    abi: Abi
    functionName: string
    args: readonly unknown[]
}): unknown


import { abi } from './abi'
const res = readContract({
    abi,
    functionName: 'balanceOf',
    args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
})

console.log(res)