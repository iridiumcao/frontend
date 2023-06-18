import React, {useEffect} from "react";
import {useQuery} from "react-query";
import {getNonce} from "@site/src/api/wallet-auth";
import {Button, Spinner} from "@site/src/components";
import LoginTipParagraph from "@site/src/components/LoginTipParagraph";
import BindWallet from "@site/src/pages/login/_BindWallet";
import {useAccount, useDisconnect, useNetwork} from "wagmi";
import {ConnectButton} from "@rainbow-me/rainbowkit";
import useAuth from "@site/src/hooks/useAuth";
import SignInSiweButton from "@site/src/components/siwe/SignInSiweButton";
import {toast} from "react-hot-toast";
import truncation from "@site/src/utils/truncation";

const ConnectWallet = () => {
    const {address} = useAccount();
    const {chain, chains} = useNetwork()
    const {disconnect} = useDisconnect()
    const {data: user, isGithubLogin, signInWithWallet} = useAuth();

    const {
        isLoading: isCheckUserStatus,
        data,
        isSuccess,
        refetch: refetchNonce,
    } = useQuery("getNonce", () => getNonce(address), {
        retry: false,
    });

    useEffect(() => {
        refetchNonce();
    }, [address])

    const isConnectErrorWallet = user?.wallet !== address // TODO(chong): 待确定

    const renderContent = () => {
        // 1. 网络错误处理
        if (chain.unsupported) {
            return (
                <ConnectButton.Custom>
                    {({openChainModal}) => (
                        <div>
                            <Button
                                onClick={openChainModal}
                                className="w-full bg-secondary-foreground text-destructive border border-destructive border-solid text-base"
                            >切换网络</Button>
                            <LoginTipParagraph text="请连接WTF支持的链" className="mb-0"/>
                        </div>
                    )}
                </ConnectButton.Custom>
            )
        }

        // 2. 加载中，检查用户状态
        if (isCheckUserStatus) {
            return (
                <div className="w-full flex flex-col items-center">
                    <Spinner loading className="mx-auto"/>
                    <LoginTipParagraph text="等待用户校验" className="mb-0"/>
                </div>
            )
        }

        // 3. 已绑定钱包，但连错，需切换钱包
        // if (isGithubLogin && isConnectErrorWallet) {
        //     const tip = `当前账户已绑定钱包 ${truncation(user?.wallet)}，请切换钱包登录`;
        //     // const tip: string = `当前账户已绑定其他钱包，请切换钱包`;
        //     return (
        //         <ConnectButton.Custom>
        //             {({openAccountModal}) => (
        //                 <div>
        //                     <Button
        //                         onClick={openAccountModal}
        //                         className="w-full bg-secondary-foreground text-destructive border border-destructive border-solid text-base"
        //                     >切换钱包</Button>
        //                     <LoginTipParagraph text={tip} className="mb-0"/>
        //                 </div>
        //             )}
        //         </ConnectButton.Custom>
        //     )
        // }

        // 4. 已正确连接绑定钱包，进行SIWE登录
        if (isSuccess) {
            return (
                <SignInSiweButton
                    nonce={data?.nonce}
                    refetchNonce={refetchNonce}
                    onSuccess={(data) => {
                        signInWithWallet(data);
                        toast.success("登录成功");
                    }}
                />
            )
        }

        return <BindWallet/>
    }

    // 5. 未绑定钱包，需绑定钱包
    return (
        <>
            {renderContent()}
            <a
                href=""
                onClick={() => disconnect()}
                className="mt-4 text-xs flex items-center text-gray-500 justify-center"
            >取消钱包登录</a>
        </>
    )
}

export default ConnectWallet;
