// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Remesh } from 'remesh';
import {
  RemeshRoot,
  RemeshScope,
  useRemeshDomain,
  useRemeshEvent,
  useRemeshQuery,
  useRemeshSend,
} from 'remesh-react';
import { map, Subject, interval, of } from 'rxjs';
import { startWith, switchMap, take, tap } from 'rxjs/operators';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

const PageDomain = Remesh.domain({
  name: 'PageDomain',
  impl(domain) {
    const PageState = domain.state({
      name: 'PageState',
      default: {
        step: 'conflict' as 'additional' | 'conflict',
      },
    });

    const PageQuery = domain.query({
      name: 'PageQuery',
      impl({ get }) {
        return get(PageState());
      },
    });

    const BackCommand = domain.command({
      name: 'BackCommand',
      impl() {
        return PageState().new({ step: 'conflict' });
      },
    });

    const CreateCommand = domain.command({
      name: 'CreateCommand',
      impl() {
        return PageState().new({ step: 'additional' });
      },
    });

    return {
      query: {
        PageQuery,
      },
      command: {
        BackCommand,
        CreateCommand,
      },
    };
  },
});

const SendCodeDomain = Remesh.domain({
  name: 'SendCodeDomain',
  impl(domain) {
    const SuccessEvent = domain.event({
      name: 'SuccessEvent',
    });

    const SendCommand = domain.command({
      name: 'SendCommand',
      impl() {
        // 假装成功
        return [SuccessEvent()];
      },
    });

    return {
      command: {
        SendCommand,
      },
      event: {
        SuccessEvent,
      },
    };
  },
});

const COUNTDOWN_SECONDS = 5;

const AdditionalDomain = Remesh.domain({
  name: 'AdditionalDomain',
  impl(domain, id: number) {
    console.log('implement domain AdditionalDomain with prop id:', id)
    // const sendCodeDomain = domain.getDomain(SendCodeDomain());
    const SuccessEvent = domain.event({
      name: 'SuccessEvent',
    });

    const SendCommand = domain.command({
      name: 'SendCommand',
      impl() {
        // 假装成功
        return [SuccessEvent()];
      },
    });

    const SendCodeCommand = domain.command({
      name: 'SendCodeCommand',
      impl() {
        return SendCommand();
      },
    });

    const SendCodeState = domain.state({
      name: 'SendCodeState',
      default: {
        tick: 0,
      },
    });

    const SendCodeQuery = domain.query({
      name: 'SendCodeQuery',
      impl({ get }) {
        const state = get(SendCodeState());
        return { tick: state.tick, disabled: state.tick > 0 };
      },
    });

    const UpdateSendCodeCommand = domain.command({
      name: 'UpdateSendCodeCommand',
      impl(_, tick: number) {
        return SendCodeState().new({ tick });
      },
    });

    domain.effect({
      name: 'SendCodeEffect',
      impl({ fromEvent }) {
        return fromEvent(SuccessEvent).pipe(
          tap((v) => {
            console.log('receive event in effect');
          }),
          switchMap(() =>
            interval(1000)
              .pipe(
                map((tick) => COUNTDOWN_SECONDS - tick - 1),
                take(COUNTDOWN_SECONDS)
              )
              .pipe(startWith(COUNTDOWN_SECONDS))
          ),
          tap((tick) => {
            console.log('tick', tick);
          }),
          map((tick) => [UpdateSendCodeCommand(tick)])
        );
      },
    });

    domain.effect({
      name: 'PrintTickEffect',
      impl({ fromQuery }) {
        return fromQuery(SendCodeQuery()).pipe(
          tap((state) => {
            console.log('got query update:', JSON.stringify(state));
          }),
          map((state) => [])
        );
      },
    });

    return {
      query: {
        SendCodeQuery,
      },
      command: {
        SendCodeCommand,
      },
      event: {
        SendCodeSuccessEvent: SuccessEvent,
      },
    };
  },
});

function Page() {
  const send = useRemeshSend();
  const domain = useRemeshDomain(PageDomain());
  const { step } = useRemeshQuery(domain.query.PageQuery());
  const [id, setId] = React.useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <div>
          fromEvent 的问题{' '}
          <a
            href="https://stackblitz.com/edit/react-ts-n8wufp?file=index.tsx"
            target="_blank"
          >
            在这里
          </a>
          。 发现 fromQuery 会有同样的 bug，以下示例添加了相关代码。
        </div>
        <div>点击 [Create] 显示 Additional 模块</div>
        <div>
          然后再点击 【Send Code】， 会有 log 【got query update:
          ...】【tick...】
        </div>
        <div>
          点击 【Back】，会发现【got query update: ...】不再被打出了， 再点击
          [Create] 也同样无效，但是 state 变量显示出来是对的。
        </div>
        <div>再次更新：实际上现在 fromQuery, fromEvent 都会造成内存泄漏了。。。</div>
        <div>------------------以上是说明------------</div>
      </div>
      <div
        onClick={() => {
          send(domain.command.BackCommand());
        }}
      >
        Back
      </div>
      {step === 'conflict' && (
        <div
          onClick={() => {
            setId((id) => id + 1);
            send(domain.command.CreateCommand());
          }}
        >
          Create
        </div>
      )}

      <div>
        下面显示 Additional -------------------------------------------------
      </div>

      {step === 'additional' && <Additional id={id} />}
    </div>
  );
}

function Additional({ id }: { id: number}) {
  const send = useRemeshSend();
  const domain = useRemeshDomain(AdditionalDomain(id));

  // 当 Additional 消失时，触发了 eventStorage 的 refCount 导致整个事件给清理
  // 这里主要演示 fromQuery 的问题，所以注释掉下面几行代码来避免 fromEvent 的问题
  useRemeshEvent(domain.event.SendCodeSuccessEvent, () => {
    console.log('receive event in view model');
  });

  // query 也有同样的 bug，有用到 query 的时候，回收机制 bug 导致 fromQuery 的 effect 无法正确订阅
  const state = useRemeshQuery(domain.query.SendCodeQuery());

  return (
    <button
      disabled={state.disabled}
      onClick={() => {
        send(domain.command.SendCodeCommand());
      }}
    >
      <>Send Code</>
      <>({state.tick})</>
    </button>
  );
}

const store = Remesh.store({
  // inspectors: [RemeshLogger()],
});

// 当 Additional 消失时，触发了 eventStorage 的 refCount 导致整个事件给清理
// 注释以下代码，即可得到预期输出。
// store.subscribeEvent(
//   store.getDomain(SendCodeDomain()).event.SuccessEvent,
//   () => {}
// );

function App() {
  return (
    <RemeshRoot store={store}>
      {/* 即使有 RemeshScope 也无事于补。 */}
      <RemeshScope domains={[AdditionalDomain(1)]}>
        <Page />
      </RemeshScope>
    </RemeshRoot>
  );
}
