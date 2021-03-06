import React, { useEffect, useRef, useState } from 'react';
import { Chart as GChart } from 'react-google-charts';
import { Button, Heading, Spinner, TABLE_CLASSES } from '@flmnh-mgcl/ui';
import FullScreenButton from './buttons/FullScreenButton';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { useChartStore } from '../../stores/chart';
import shallow from 'zustand/shallow';
import statsImage from '../assets/svg/stats.svg';
import CreateDownloadModal from './modals/CreateDownloadModal';
import ShowQueryButton from './buttons/ShowQueryButton';
import { getConfigModal } from './modals/charts/utils';

function EmptyTableArt() {
  return (
    <div className="absolute bottom-0 inset-0 flex flex-col items-center justify-center pointer-events-none">
      <img className="object-scale-down h-64 my-6 w-auto" src={statsImage} />
      <Heading tag="h3" className="mt-3 text-center ">
        Configure a chart to get started
      </Heading>
    </div>
  );
}

type Props = {
  fullScreen: boolean;
  toggle: () => void;
};

export default function Chart({ fullScreen, toggle }: Props) {
  const data = useChartStore((state) => state.data, shallow);

  const chartRef = useRef<any>();

  const [key, setKey] = useState(true);
  const controls = useAnimation();

  useEffect(() => {
    if (fullScreen) {
      controls.start({
        width: '100%',
        transition: { duration: 0.25 },
      });
    } else {
      controls.start({
        width: '75%',
        transition: { duration: 0.25 },
      });
    }

    // toggling the key here to force Google Chart to redraw itself with the new
    // sizing parameters. I added the 201 delay, since the animations have a 200
    // duration time.
    setTimeout(() => setKey((previousKey) => !previousKey), 251);
  }, [fullScreen]);

  const { chartType, options } = useChartStore(
    (state) => state.config,
    shallow
  );
  const setData = useChartStore((state) => state.setData);
  const setCurrentQuery = useChartStore((state) => state.setCurrentQuery);

  useEffect(() => {
    setKey((previousKey) => !previousKey);
  }, [options, data]);

  function onClear() {
    setData([]);
    setCurrentQuery('');
  }

  return (
    <AnimatePresence>
      <motion.div
        className="flex flex-col relative shadow-around-lg bg-white dark:bg-dark-800 rounded-md shadow-around-lg h-full flex-1 overflow-hidden"
        animate={controls}
        initial={{ width: fullScreen ? '100%' : '75%' }}
      >
        <div className="flex-1 p-2 w-full h-full">
          {/* <GChart
            ref={chartRef}
            key={Number(key)}
            height="100%"
            width="100%"
            chartType={chartType}
            loader={<Spinner active={true} />}
            options={options}
            data={[
              [
                'Month',
                'Bolivia',
                'Ecuador',
                'Madagascar',
                'Papua New Guinea',
                'Rwanda',
                'Average',
              ],
              ['2004/05', 165, 938, 522, 998, 450, 614.6],
              ['2005/06', 135, 1120, 599, 1268, 288, 682],
              ['2006/07', 157, 1167, 587, 807, 397, 623],
              ['2007/08', 139, 1110, 615, 968, 215, 609.4],
              ['2008/09', 136, 691, 629, 1026, 366, 569.6],
            ]}
          /> */}
          {data && !!data.length && (
            <GChart
              ref={chartRef}
              key={Number(key)}
              height="100%"
              width="100%"
              chartType={chartType}
              loader={<Spinner active={true} />}
              options={options}
              data={data}
            />
          )}

          {!data || (!data.length && <EmptyTableArt />)}
        </div>
        <nav className={TABLE_CLASSES.footer}>
          <Button.Group>
            <Button
              variant="danger"
              disabled={!data || !data.length}
              onClick={onClear}
            >
              Clear Chart
            </Button>

            <CreateDownloadModal
              variant="default"
              data={data ?? []}
              disableDownload={!data || !data.length}
              separator=","
            />

            <ShowQueryButton variant="chart" />
          </Button.Group>
          <div className="flex space-x-2">
            {getConfigModal(chartType)}
            <FullScreenButton fullScreen={fullScreen} toggle={toggle} />
          </div>
        </nav>
      </motion.div>
    </AnimatePresence>
  );
}
